# NAT

NAT stands for 
- NodeJS
- Aria
- Tools

## Requirements

- NodeJS 16

## Usage

### First Run

Make sure to download the certificates locally. Paste them in ~/.m2/keystore. You must have a `cert.pem` and a `private_key.pem`.
After that, create 

Running
```bash
nat --init
```
Will install vrotsc and vropkg globally for you... you can specify different version of btva by passing --btvaVersion=2.35.0

### General

```
nat -b -p
```
This will be all you need... it will do mvn clean package if the target folder does not exists, since for now it still depends on it for certificates and
dependencies

## Improvements

- [x] Better Certificate Handling. Certificates should only work with local paths.
- [x] Better vrotsc/vropkg installation
- [x] More Customizability regarding inputs
- [x] Don't rely on initial mvn clean package
- [x] Building Code
- [x] Compiling Code
- [x] Convert information about the artifact to a special lock file.
- [ ] Introduce a fast mode... Essentially separate config elements from the rest, so we can delete the package before hand with all of it's content and
  re-import it
- [ ] Pushing code - Alpha
- [ ] Improve Push Code Logic
- [ ] Download dependencies and push them
- [ ] Definitions? 
- [ ] Save Artifact in memory so we don't read it twice
- [ ] Don't rely on vrotsc and vropkg from maven central
- [ ] Improve vrotsc and vropkg. Realistically I can rewrite them to depreciate support for vro 7 which will improve them significantly. Improve I/O may lead to significant improvements.
- [ ] Running Tests

## Development

### Setting Up BTVA Dependencies

- Follow the instructrions for the first run.
- run `npm run dev` in one terminal first
- run `tsc --watch` in one terminal and keep it running
