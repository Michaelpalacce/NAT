# NAT

NAT stands for 
- NodeJS
- Aria
- Tools

## Development

### Setting Up BTVA Dependencies

We need to npm link both vrotsc and vropkg. 

`npm link` allows us to use the local modules without pushing them to npm.

```bash
cd ./btva/typescript/vrotsc
npm link 
cd ../vropkg
npm link
```

