import os from 'os';
import { Request } from 'express';

export function getIPv4Address() {
    var interfaces = os.networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName] || [];

        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }
    return '0.0.0.0';
}

export function extractRemoteAddrFromRequest(req: Request): string | undefined {
    if (req.headers && Object.hasOwnProperty.bind(req)('x-forwarded-for')) {
        return String(req.headers['x-forwarded-for']);
    }

    if (req.headers && Object.hasOwnProperty.bind(req)('x-remote-addr')) {
        return String(req.headers['x-remote-addr']);
    }

    if (req.headers && Object.hasOwnProperty.bind(req)('x-real-ip')) {
        return String(req.headers['x-real-ip']);
    }

    if (req.connection && Object.hasOwnProperty.bind(req)('remoteAddress')) {
        return String(req.connection['remoteAddress']);
    }

    return '0.0.0.0';
}