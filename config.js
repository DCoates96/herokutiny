
module.exports = {
	URL: cleanURL(process.env.URL) || "127.0.0.1",
	INTERNAL_URL: cleanURL(process.env.INTERNAL_URL) || module.exports.URL,
	ENV: process.env.NODE_ENV || process.env.ENV || 'production',
	LOG_LEVEL: process.env.LOG_LEVEL || 'info',
	BASE_LANG: process.env.BASE_LANG || 'en_US',
	STROKES_PER_MINUTE: process.env.STROKES_PER_MINUTE || false,
	DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE || 'Etc/UTC',

	DUPLICATE_TIMEOUT: process.env.DUPLICATE_TIMEOUT || 3000,
	SEND_DEBUG_MESSAGES: process.env.SEND_DEBUG_MESSAGES === 'true' || false, //if debug information should be sent along messages

	EXPRESS: {
		HOST: process.env.EXPRESS_HOST || process.env.HOST || '0.0.0.0',
		PORT: process.env.EXPRESS_PORT || process.env.PORT || 8000,
	},
	SEQUELIZE: {
		HOST: process.env.DB_HOST || process.env.MYSQL_HOST || 'chooterdb.cc9pvrhglmip.us-east-1.rds.amazonaws.com',
		USERNAME: process.env.DB_USER || process.env.MYSQL_USER || 'chooter',
		PASSWORD: process.env.DB_PASS || process.env.MYSQL_PASSWORD || 'Chooter132',
		DATABASE: process.env.DB_DB || process.env.MYSQL_DATABASE || 'chooter',
		PORT: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
		DIALECT: process.env.DB_DIALECT || 'mysql',
		CHARSET: process.env.DB_CHARSET || 'utf8mb4',
		ENCRYPT: process.env.DB_ENCRYPT === 'true' || false,
		COLLATION: process.env.DB_COLLATION || 'utf8mb4_general_ci',
		LOGGING: process.env.DB_LOGGING === 'true' || false,
		LOGGING_LEVEL: process.env.DB_LOGGING_LEVEL || 'debug',
		MAX_CONNECTIONS: process.env.DB_MAX_CONNECTIONS || 5,
		MIN_CONNECTIONS: process.env.DB_MIN_CONNECTIONS || 1,
		MAX_IDLETIME: process.env.DB_MAX_IDLETIME || 30000,
		ACQUIRE_TIMEOUT: process.env.DB_ACQUIRE_TIMEOUT || 30000,
		REQUEST_TIMEOUT: process.env.DB_REQUEST_TIMEOUT || 30000,
		EVICT_INTERVAL: process.env.DB_EVICT_INTERVAL || 10000,
	},
	AWS: {
		USER_POOL_ID: process.env.AWS_USER_POOL_ID || 'us-east-1_Kr0sRIB7I',
		CLIENT_ID: process.env.AWS_CLIENT_ID || '750brv3g5k39nbg78pdrsp5f1c',
		POOL_REGION: process.env.AWS_POOL_REGION || 'us-east-1',
	},
	WEBVIEW: {
		FILE_SIZE_LIMIT: process.env.FILE_SIZE_LIMIT || 5120000,
		FILE_AMOUNT_LIMIT: process.env.FILE_AMOUNT_LIMIT || 3,
		MIME_TYPE_WHITELIST:
			process.env.MIME_TYPE_WHITELIST || 'image/jpeg, image/jpg, image/png, application/pdf',
	},
	STRIPE: {
		PUBLISH_KEY: process.env.STRIPE_PUBLISH_KEY || '',
		TEST_KEY: process.env.STRIPE_TEST_KEY || '',
	}
};

/**
 * Force URL to https and remove trailing slash.
 * @param url
 * @returns {XML|string}
 */
function cleanURL(url) {
	if (url) {
		return url.replace(/^http:\/\//i, 'https://').replace(/\/+$/, '');
	}
}
