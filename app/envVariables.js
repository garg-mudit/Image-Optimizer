//Set env
process.env.NODE_ENV = 'production';

exports.isDev = process.env.NODE_ENV !== 'production' ? true : false;

//PlatformInto (Mac -> Darwin, Windows -> win32, linux -> linux)
exports.isMac = process.platform === 'darwin' ? true : false;
