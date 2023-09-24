# NAT

NAT stands for 
- NodeJS
- Aria
- Tools

## Usage

### First Run

Make sure to download the certificates locally.

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

- [x] Better Certificate Handling. Certificates should only work with local paths.
- [x] Better vrotsc/vropkg installation
- [x] More Customizability regarding inputs
- [x] Don't rely on initial mvn clean package
- [x] Convert information about the artifact to a special lock file.
- [ ] Pushing code
- [ ] Download dependencies
- [ ] Don't rely on vrotsc and vropkg from maven central

## Development

### Setting Up BTVA Dependencies

You need to run

```bash
nat --init
```
once before you start using nat.. this is global.

