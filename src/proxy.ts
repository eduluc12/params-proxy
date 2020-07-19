import * as Net from 'net';
import {EventEmitter} from "events";

export class Proxy extends EventEmitter{

    private _options : any;
    private _server : any;

    constructor(){
        super();
        this._options = {};
        this.initialize();
    }

    private initialize(){
        this._server = Net.createServer();
        this._server.on('connection', this.connection.bind(this))
    }

    private connection(socket : any){
        let connectData = {} as any;
        let connectSocket;
        //
        const bytesDefaultParameters = 4;
        let bufferParams : Buffer = null;
        let bufferParamsReference : Buffer = null;
        let lengthMaxParams = 0;
        let flagPassParams = false;
        let flagEndParams = false;
        let initializeConnection = false;
        let bufferParamsIncomingBytes = 0;

        socket.on('data', (buffer : Buffer) => {
            if(flagEndParams) return;
            if(socket.bytesRead >= 4 && !flagPassParams){
                lengthMaxParams = buffer.readInt32BE(0);
                bufferParams = Buffer.alloc(lengthMaxParams + bytesDefaultParameters);
                flagPassParams = true;
            }
            if(!flagEndParams && flagPassParams){
                bufferParamsIncomingBytes += buffer.byteLength;
                const bufferOriginalBytes = buffer.byteLength;
                buffer.copy(
                    bufferParams, 
                    (bufferParamsIncomingBytes - bufferOriginalBytes)
                );
                if(bufferParamsIncomingBytes >= lengthMaxParams + bytesDefaultParameters){
                    const difference = bufferParamsIncomingBytes - (lengthMaxParams + bytesDefaultParameters);
                    bufferParamsReference = bufferParams.slice(
                        bytesDefaultParameters,
                        difference > 0 ? (bufferParamsIncomingBytes - difference) : bufferParams.byteLength
                    );
                    flagEndParams = true;
                    this.emit('params', 
                        bufferParamsReference,
                        (options : any) => {
                            connectData = options;
                            initializeConnection = true;
                        }
                    );
                    if(!initializeConnection){
                        return;
                    }
                    connectSocket = Net.createConnection(
                        connectData, 
                        () => {
                            const eventsName = this.eventNames();
                            const existsEventProxy = eventsName.includes('proxy');
                            if(!existsEventProxy){
                                this.on('proxy', (client, proxy) => {
                                    client.on('data', (buffer) => {
                                        proxy.write(buffer);
                                    })
                                    proxy.on('data', (data) => {
                                        client.write(data);
                                    });
                                });
                            }
                            this.emit('proxy', socket, connectSocket);
                            socket.write(Buffer.from([0x01]));
                        }
                    );
                    connectSocket.on('error', (e) => {
                        this.emit('error', e);
                        socket.write(Buffer.from([0x00]));
                    })
                }
            }
        })
    }

    public listen(options : any, cb? : any){
        this._server.listen(options, cb);
    }

}