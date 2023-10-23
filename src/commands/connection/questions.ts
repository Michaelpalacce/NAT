import { InputQuestion } from "inquirer";
import { DEFAULT_CONNECTION_NAME } from "../../arguments.js";

const questions: InputQuestion[] = [
	{
		name: "name",
		type: "input",
		message: "Name connection: ",
		default: DEFAULT_CONNECTION_NAME
	},
	{
		name: "url",
		type: "input",
		message: "FQDN : ",
		default: "vra-l-01a.corp.local"
	},
	{
		name: "port",
		type: "input",
		message: "Port: ",
		default: "443"
	},
	{
		name: "username",
		type: "input",
		message: "Username: ",
		default: "configurationadmin"
	},
	{
		name: "password",
		type: "input",
		message: "Password (Optional): ",
		default: "VMware1!"
	},
	{
		name: "domain",
		type: "input",
		message: "Domain: ",
		default: "System Domain"
	},
	{
		name: "refreshToken",
		type: "input",
		message: "Refresh Token (Optional): "
	}
];

export default questions;
