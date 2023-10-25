import axios from "axios";
import Configuration from "../configuration.js";
import FormData from "form-data";
import { ReadStream } from "fs";

export default class OrchestratorClient {
	constructor(private configuration: Configuration) { }

	/**
	* Imports the given readstream. The name of the package must also be provided
	*/
	public async importPackage(packageName: string, file: ReadStream) {
		// Create a new form instance
		const form = new FormData();

		form.append('file', file, packageName);
		form.append('overwrite', 'true');
		form.append('tagImportMode', 'ImportAndOverwriteExistingValue');
		form.append('importConfigurationAttributeValues', 'false');
		form.append('importConfigSecureStringAttributeValues', 'false');

		const url = `https://${this.configuration.getUrl()}/vco/api/packages`;
		return await axios.post(url, form, { headers: form.getHeaders() }).catch(e => e);
	}
}
