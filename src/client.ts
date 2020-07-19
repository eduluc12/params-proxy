import * as Net from 'net';
import {EventEmitter} from "events";

export class Client extends EventEmitter{

    private _connection : any;
    private _options : any;
    private _params : any;
    private _pass : boolean = false;

    constructor(
        params : string | Buffer,
        options : any
    ){
        super();
        this._params = params;
        this._options = options;
    }

    public connect(){
        this._connection = Net.createConnection(this._options, () => {
            const bufferParams =  (!(this._params instanceof Buffer)) ? 
                                    Buffer.from(this._params) : this._params;
            const bufferLength = Buffer.alloc(4);
            bufferLength.writeUInt32BE(bufferParams.byteLength, 0);
            this._connection.write(Buffer.concat(
                [
                    bufferLength,
                    bufferParams
                ]
            ));
        });
        this._connection.on('data', (buffer) => {
            if(this._pass){
                this.emit('data', buffer);
                return;
            }
            if(buffer[0] == 0x00 && !this._pass){
                this.emit('error', new Error('bad connection'));
                this._connection.destroy();
                return;
            }
            if(buffer[0] == 0x01 && !this._pass){
                this._pass = true;
                this.emit('connect');
                return;
            }
        })
        this._connection.on('drain', () => {
            this.emit('drain');
        })
        this._connection.on('end', () => {
            this.emit('end');
        })
        this._connection.on('error', (e) => {
            this.emit('error', e);
        })
        this._connection.on('lookup', () => {
            this.emit('lookup');
        })
        this._connection.on('ready', () => {
            this.emit('ready');
        })
    }

    public get connection(){
        return this._connection;
    }

}