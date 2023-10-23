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

```bash
nat --init
```
Will install vrotsc, vropkg and vrotest globally for you... you can specify different version of btva by passing --btvaVersion=2.35.0

### General

```
nat -b -p
```
This will be all you need...
(TEMP)it will do `mvn clean package` if the `target` folder does not exists, since for now it still depends on it for dependencies (TEMP)

### Tests

```
nat -t
```
This will test the code. You must have built it beforehand (or you can add `-b` to the command).

### Performance

#### Watch Mode

In one terminal:
```
nat --watch
```
Will build the code and start recompiling only the changed file.

in a separate terminal you can run `nat -p` to push the code when it completes or even `nat -t` to run unit tests

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
- [ ] Only push changed files for watch mode?
- [ ] Code Coverage
- [ ] Download dependencies and push them too
- [ ] Definitions? 
- [ ] Don't rely on vrotsc, vropkg and vrotest from maven central

## Development

### Setting Up BTVA Dependencies

- Follow the instructrions for the first run.
- run `npm run dev` in one terminal first
- run `tsc --watch` in one terminal and keep it running
