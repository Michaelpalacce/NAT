# NAT

NAT stands for 
- NodeJS
- Aria
- Tools

## Requirements

- NodeJS 16

## Philosophy

Actions are segmented and are not run unless needed. This allows for faster compilation when needed.

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

### Tests

```
nat -b -t
```
This will build and test the code

### Performance

#### Watch Mode

In one terminal:
```
nat --watch
```
Will build the code and start recompiling only the changed file.

in a separate terminal you can run `nat -p` to push the code when it completes or even `nat -t` for tests

## Improvements

- [x] Better Certificate Handling. Certificates should only work with local paths.
- [x] Better vrotsc/vropkg installation
- [x] More Customizability regarding inputs
- [x] Don't rely on initial mvn clean package
- [x] Building Code
- [x] Compiling Code
- [x] Convert information about the artifact to a special lock file.
- [x] Pushing code
- [x] Running Tests
- [x] Save Artifact in memory so we don't read it twice
- [ ] Improve Push Code Logic
- [ ] Download dependencies and push them
- [ ] Definitions? 
- [ ] Don't rely on vrotsc and vropkg from maven central

## Development

### Setting Up BTVA Dependencies

- Follow the instructrions for the first run.
- run `npm run dev` in one terminal first
- run `tsc --watch` in one terminal and keep it running
