# NAT

NAT stands for 
- NodeJS
- Aria
- Tools

## Usage

### First Run

Running
```bash
nat --init
```
Will install vrotsc and vropkg globally for you... you can specify different version of btva by passing --btvaVersion=2.35.0

### General

```
nat
```
This will be all you need... it will do mvn clean package if the target folder does not exists, since for now it still depends on it for certificates and
dependencies

## Improvements

- [ ] Better Certificate Handling. Certificates should only work with local paths.
- [ ] Better cleaning of the .nat folder. Only delete specific things inside.
- [x] Better vrotsc/vropkg installation
- [ ] Pushing code
- [x] More Customizability regarding inputs
- [ ] Download dependencies
- [x] Don't rely on initial mvn clean package
- [x] Convert information about the artifact to a special lock file.

## Development

### Setting Up BTVA Dependencies

You need to run

```bash
nat --init
```
once before you start using nat.. this is global.

