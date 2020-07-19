# Params Proxy

Create a proxy with the ability to custom connection

## Usage for Server

```node
import {Proxy} from "params-proxy"
import {Client} from "./client"

const ref = new Proxy();
ref.on('params', (buffer, connect) => {
    //const processParams = buffer
    //connect(processParams);
});
ref.on('proxy', (client, proxy) => {
    client.on('data', (buffer) => {
    })
    proxy.on('data', (data) => {
    });
});
ref.listen({
    port: 8124
});
```
## Usage for Client

```node
const params = '';
const ref = new Client(params, {
    port: 8124
});
ref.on('connect', () => {
    console.log('connected to server destination!');
})
ref.on('data', (buffer) => {
})
ref.connect();
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)