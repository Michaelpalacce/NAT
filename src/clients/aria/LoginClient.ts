import axios, { AxiosError, AxiosRequestConfig } from "axios";
import logger from "../../logger/logger.js";
import Configuration from "../configuration.js";
import { getConnection } from "../../nat/connection.js";

export default class LoginClient {
	private token: string | null;
	private requestInterceptor: number;
	private responseInterceptor: number;

	constructor(private configuration: Configuration) {
	}

	public getConfig(): Configuration {
		return this.configuration;
	}

	static async fromConnection(connectionName: string): Promise<LoginClient> {
		return new LoginClient(new Configuration(await getConnection(connectionName)));
	}

	/**
	 * Attaches a login interceptor on global axios instance
	 *
	 * Attaches an error interceptor that will reauth in case of 401 as well
	 * 			IMPORTANT: There should be ONLY ONE login interceptor of each type  in the axios global instance, make sure to attach it
	 * 						and then safely remove it
	 */
	public setLoginInterceptorInInstance() {
		this.requestInterceptor = axios.interceptors.request.use(this.getLoginInterceptor());
		this.responseInterceptor = axios.interceptors.response.use(undefined, this.getErrorInterceptor());
	}

	/**
	 * Removes the set login interceptor
	 */
	public removeLoginInterceptorFromInstance() {
		axios.interceptors.request.eject(this.requestInterceptor);
		axios.interceptors.response.eject(this.responseInterceptor);
	}

	/**
	 * Login interceptor that will perform a login if needed.
	 */
	public getLoginInterceptor() {
		return async (config) => {
			if (!config?.url?.includes(this.configuration.getUrl())) {
				return config;
			}
			logger.silly(`${config?.method} ${config?.url}`);

			await this.performAuth(config);

			return config;
		};
	}

	/**
	 * Error interceptor to be attached to all axios requests
	 */
	public getErrorInterceptor() {
		return async (error: AxiosError) => {
			if (!error?.config?.url?.includes(this.configuration.getUrl()))
				return Promise.reject(error);

			const status = error.response ? error.response.status : null;
			console.log(status);

			if (status === 401) {
				this.token = null;
				await this.performAuth(error.config);
				logger.warn("vRA-NG: Attempting to re-authenticate");

				return axios.request(error.config);
			}

			logger.verbose(`Error occurred! URL: ${error?.config?.url} Status Code: ${error?.code} Message: ${error?.message}. Response: ${JSON.stringify(error?.response?.data)}`);

			return Promise.reject(error);
		};
	}

	/**
	 * Performs a login and sets the token in the class instance
	 *
	 * Uses a separate axiosInstance. This is intentional, otherwise it will infinitely loop
	 */
	protected async login(): Promise<void> {
		if (this.token) {
			logger.silly("Token already set, skipping!");
			return;
		}

		// !!! IMPORTANT !!! Do not use the axiosInstance, this is intentional, otherwise it will infinite loop
		const axiosLoginInstance = axios.create();

		const authResponseAxiosResponse = await axiosLoginInstance.post(
			`${this.getBaseUrl()}/iaas/api/login`,
			{ refreshToken: await this.getRefreshToken() }
		);

		if (authResponseAxiosResponse.status !== 200) {
			throw authResponseAxiosResponse;
		}

		this.token = authResponseAxiosResponse.data.token;

		logger.verbose(`Authentication was needed for vRA-NG, retrieved a new token.`);
	}

	/**
	 * Retrieves the refresh token from the configuration, if it's not set, attempts to do a refresh token request
	 *
	 * @private
	 */
	private async getRefreshToken(): Promise<string> {
		const configRefreshToken = this.configuration.getRefreshToken();
		if (configRefreshToken) {
			logger.silly("Refresh token detected in configuration.");
			return configRefreshToken;
		}

		logger.silly("No refresh token was set in configuration, attempting username and password auth.");
		const axiosLoginInstance = axios.create();
		const loginData = {
			username: this.configuration.getUsername(),
			password: this.configuration.getPassword()
		};

		if (this.configuration.getDomain()) {
			loginData["domain"] = this.configuration.getDomain();
		}

		const response = await axiosLoginInstance.post(
			`${this.getBaseUrl()}/csp/gateway/am/api/login?access_token`, loginData
		);

		if (response.status !== 200 || !response.data["refresh_token"])
			throw response;

		return response.data["refresh_token"];
	}

	/**
	 * Perform authentication and set the Bearer Token
	 */
	private async performAuth(config: AxiosRequestConfig) {
		await this.login();

		if (!config.headers)
			config.headers = {};

		config.headers["Authorization"] = `Bearer ${this.token}`;
	}

	public getBaseUrl() {
		return `https://${this.configuration.getUrl()}:${this.configuration.getPort()}`;
	}
}
