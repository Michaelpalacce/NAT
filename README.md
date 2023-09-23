# NAT

NAT stands for 
- NodeJS
- Aria
- Tools

## Improvements

- [ ] Better Certificate Handling
- [ ] Better vrotsc/vropkg installation
- [ ] Pushing code
- [ ] More Customizability regarding inputs
- [ ] Download dependencies
- [ ] Don't rely on initial mvn clean package
- [ ] Convert information about the artifact to a special lock file.

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

### Setting Version To Latest Release

Modify the pom.xml in the btva folder and make sure to set the revision to the latest release version

## Troubleshooting

### vrotsc and vropkg building issues..

- Remove tests... 
- Install extra dependencies
- Run `npm i` manually and see what happens.. 
- Run the commands manually and see what happens
