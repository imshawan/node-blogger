/*
 * Copyright (C) 2023 Shawan Mandal <github@imshawan.dev>.
 *
 * Licensed under the GNU General Public License v3, 29 June 2007
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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