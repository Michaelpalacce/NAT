#! /usr/bin/env node
import { execa } from "execa";
import { existsSync, mkdirSync, rmdirSync } from "fs";
import { join } from "path";

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
	{ name: 'verbose', alias: 'v', type: Boolean },
	{ name: 'src', type: String, multiple: true, defaultOption: true },
	{ name: 'timeout', alias: 't', type: Number }
];
const options = commandLineArgs(optionDefinitions);

console.log(options);

// TYPESCRIPT
/**
[/home/stefan/Projects/Javascript/nat/test/node_modules/@vmware-pscoe/vrotsc/bin/vrotsc, src, --actionsNamespace, com.vmware.pscoe.test, --workflowsNamespace, test, --files, , --typesOut, target/vro-types, --testsOut, target/vro-sources/test/com/vmware
/pscoe/test, --mapsOut, target/vro-sources/map/com/vmware/pscoe/test, --actionsOut, target/vro-sources/js/src/main/resources/com/vmware/pscoe/test, --testHelpersOut, target/vro-sources/testHelpers/src/main/resources/com/vmware/pscoe/test, --workflowsOu
t, target/vro-sources/xml/src/main/resources/Workflow, --policiesOut, target/vro-sources/xml/src/main/resources/PolicyTemplate, --resourcesOut, target/vro-sources/xml/src/main/resources/ResourceElement, --configsOut, target/vro-sources/xml/src/main/res
ources/ConfigurationElement]
*/

function ensureDirClean(dir: string) {
	if (existsSync(dir))
		rmdirSync(dir, { recursive: true });
	else
		mkdirSync(dir);
}

const cwd = process.cwd();
const outFolder = join(cwd, "nat");
const groupId = 'com.vmware.pscoe';
const artifactId = 'test';
const fullArtifactId = `${groupId}.${artifactId}`;

ensureDirClean(outFolder);

const vrotsc = execa('vrotsc', ['src', '--actionsNamespace', fullArtifactId, '--workflowsNamespace', artifactId, '--files',
	'--typesOut', `${outFolder}/vro-types`, '--testsOut', `${outFolder}/vro-sources/test/com/vmware/pscoe/test`,
	'--mapsOut', `${outFolder}/vro-sources/map/com/vmware/pscoe/test`, '--actionsOut', `${outFolder}/vro-sources/js/src/main/resources/com/vmware/pscoe/test`,
	'--testHelpersOut', `${outFolder}/vro-sources/testHelpers/src/main/resources/com/vmware/pscoe/test`, '--workflowsOut',
	`${outFolder}/vro-sources/xml/src/main/resources/Workflow`, '--policiesOut', `${outFolder}/vro-sources/xml/src/main/resources/PolicyTemplate`, '--resourcesOut',
	`${outFolder}/vro-sources/xml/src/main/resources/ResourceElement`, '--configsOut', `${outFolder}/vro-sources/xml/src/main/resources/ConfigurationElement`]);


//VROPKG
/**
[INFO] Building vRO package 'com.vmware.pscoe.test-1.0.0-SNAPSHOT.package' to: /home/stefan/Projects/Javascript/nat/test/target
[/home/stefan/Projects/Javascript/nat/test/node_modules/@vmware-pscoe/vropkg/bin/vropkg, --in, js, --srcPath, /home/stefan/Projects/Javascript/nat/test/target/vro-sources/js, --out, tree, --destPath, /home/stefan/Projects/Javascript/nat/test/target/vro
-sources/xml, --privateKeyPEM, target/keystore.example-2.35.0/private_key.pem, --certificatesPEM, target/keystore.example-2.35.0/cert.pem, --keyPass, VMware1!, --version, 1.0.0-SNAPSHOT, --packaging, package, --artifactId, test, --description, This pac
kage is licensed under null, --groupId, com.vmware.pscoe]
[INFO] Running vropkg... started
[INFO] info: Parsing vro javascript project folder path "/home/stefan/Projects/Javascript/nat/test/target/vro-sources/js"...
[INFO] Running vropkg... finished
[/home/stefan/Projects/Javascript/nat/test/node_modules/@vmware-pscoe/vropkg/bin/vropkg, --in, tree, --srcPath, /home/stefan/Projects/Javascript/nat/test/target/vro-sources/xml, --out, flat, --destPath, /home/stefan/Projects/Javascript/nat/test/target/
vropkg, --privateKeyPEM, target/keystore.example-2.35.0/private_key.pem, --certificatesPEM, target/keystore.example-2.35.0/cert.pem, --keyPass, VMware1!, --version, 1.0.0-SNAPSHOT, --packaging, package, --artifactId, test, --description, This package i
s licensed under null, --groupId, com.vmware.pscoe]
*/
