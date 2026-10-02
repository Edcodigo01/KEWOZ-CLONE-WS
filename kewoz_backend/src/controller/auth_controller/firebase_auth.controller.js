const admin = require('firebase-admin');
const path = require('path');
const { User } = require('../../../models');
const { generateToken } = require('../../service/common/token.service');
const { generalResponse } = require('../../helper/response.helper');

let firebaseInitialized = false;

function initFirebase() {
    if (firebaseInitialized) return;
    try {
        const serviceAccountPath = path.resolve(process.cwd(), 'uploads/firebase/firebase-auth-service.json');
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        firebaseInitialized = true;
        console.log('[Firebase Auth] Initialized with service account');
    } catch (error) {
        console.error('[Firebase Auth] Init error:', error.message);
    }
}

function normalizePhone(phone, countryCode) {
    if (!phone) return '';
    let p = String(phone).replace(/[\s\-\(\.]/g, '').trim();
    if (p.startsWith('+')) p = p.substring(1);
    if (countryCode) {
        const cc = String(countryCode).replace(/[\+\s]/g, '').trim();
        if (cc && p.startsWith(cc)) {
            p = p.substring(cc.length);
        }
    }
    if (p.startsWith('00')) p = p.substring(2);
    if (p.startsWith('0')) p = p.substring(1);
    return p;
}

async function firebaseVerify(req, res) {
    try {
        const { id_token, phone_number, country_code } = req.body;

        if (!id_token) {
            return generalResponse(res, {}, 'id_token is required', false, true, 400);
        }
        if (!phone_number) {
            return generalResponse(res, {}, 'phone_number is required', false, true, 400);
        }

        initFirebase();

        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(id_token);
        } catch (error) {
            console.error('[Firebase Auth] Token verification failed:', error.message);
            return generalResponse(res, {}, 'Invalid or expired Firebase token', false, true, 401);
        }

        const firebaseUid = decodedToken.uid;
        const firebasePhoneE164 = decodedToken.phone_number || '';
        const firebaseEmail = decodedToken.email || '';

        let reqCountryCode = (country_code || '').toString().trim();
        if (!reqCountryCode && firebasePhoneE164.startsWith('+')) {
            const m = firebasePhoneE164.match(/^\+(\d{1,3})/);
            if (m) reqCountryCode = '+' + m[1];
        }

        console.log('[Firebase Auth] Verified UID:', firebaseUid, 'E164:', firebasePhoneE164, 'Body phone:', phone_number, 'CC:', reqCountryCode);

        const dbPhoneFormat = normalizePhone(phone_number, reqCountryCode);
        const firebaseDbFormat = normalizePhone(firebasePhoneE164, reqCountryCode);

        console.log('[Firebase Auth] Normalized - body:', dbPhoneFormat, 'firebase:', firebaseDbFormat);

        let user = await User.findOne({
            where: { firebase_uid: firebaseUid }
        });

        if (!user) {
            const phoneVariants = [...new Set([dbPhoneFormat, firebaseDbFormat, phone_number, firebasePhoneE164].filter(Boolean))];
            console.log('[Firebase Auth] Trying phone variants:', phoneVariants);

            for (const variant of phoneVariants) {
                user = await User.findOne({
                    where: { mobile_num: variant }
                });
                if (user) {
                    console.log('[Firebase Auth] Found user by phone variant:', variant, '-> user_id:', user.user_id);
                    break;
                }
            }

            if (user && !user.firebase_uid) {
                console.log('[Firebase Auth] Saving firebase_uid to existing user:', user.user_id);
                await user.update({
                    firebase_uid: firebaseUid,
                    verified: true,
                    login_type: 'firebase',
                    device_token: req.body.device_token || user.device_token,
                });
            }
        }

        if (user) {
            console.log('[Firebase Auth] Existing user:', user.user_id);
            await user.update({
                login_type: 'firebase',
                verified: true,
                device_token: req.body.device_token || user.device_token,
            });
        } else {
            console.log('[Firebase Auth] Creating new user for phone:', dbPhoneFormat);
            const userName = 'user_' + Date.now();
            try {
                user = await User.create({
                    first_name: req.body.first_name || '',
                    last_name: req.body.last_name || '',
                    user_name: userName,
                    full_name: req.body.full_name || userName,
                    email: firebaseEmail || null,
                    country_code: reqCountryCode || '',
                    mobile_num: dbPhoneFormat,
                    login_type: 'firebase',
                    password: 'firebase_auth',
                    profile_pic: '',
                    gender: 'Male',
                    country: '',
                    country_short_name: '',
                    state: '',
                    city: '',
                    description: 'Available',
                    device_token: req.body.device_token || '',
                    platforms: ['android'],
                    profile_setup_step: 0,
                    firebase_uid: firebaseUid,
                    verified: true,
                });
                console.log('[Firebase Auth] New user created:', user.user_id);
            } catch (createError) {
                if (createError.name === 'SequelizeUniqueConstraintError') {
                    console.warn('[Firebase Auth] Duplicate on create, fetching existing user. Error:', createError.errors?.[0]?.message);
                    // Try to find existing user by firebase_uid or mobile_num
                    user = await User.findOne({ where: { firebase_uid: firebaseUid } });
                    if (!user) {
                        const phoneVariants = [...new Set([dbPhoneFormat, firebaseDbFormat, phone_number, firebasePhoneE164].filter(Boolean))];
                        for (const variant of phoneVariants) {
                            user = await User.findOne({ where: { mobile_num: variant } });
                            if (user) break;
                        }
                    }
                    if (user) {
                        console.log('[Firebase Auth] Found existing user after duplicate error:', user.user_id);
                        await user.update({
                            login_type: 'firebase',
                            verified: true,
                            device_token: req.body.device_token || user.device_token,
                        });
                    } else {
                        console.error('[Firebase Auth] Could not find existing user after duplicate error');
                        return generalResponse(res, {}, 'User with this phone or firebase_uid already exists', false, true, 409);
                    }
                } else if (createError.name === 'SequelizeValidationError') {
                    console.error('[Firebase Auth] Validation error on create:', createError.errors?.[0]?.message);
                    return generalResponse(res, {}, createError.errors?.[0]?.message || 'Invalid user data', false, true, 400);
                } else {
                    throw createError;
                }
            }
        }

        const tokenPayload = {
            user_id: user.user_id,
            mobile_num: user.mobile_num,
            login_type: 'firebase',
            is_admin: user.is_admin || false,
        };
        const kewozToken = generateToken(tokenPayload);

        const userData = {
            user_id: user.user_id,
            first_name: user.first_name,
            last_name: user.last_name,
            user_name: user.user_name,
            full_name: user.full_name,
            email: user.email,
            mobile_num: user.mobile_num,
            country_code: user.country_code,
            profile_pic: user.profile_pic,
            login_type: user.login_type,
            profile_setup_step: user.profile_setup_step,
            is_admin: user.is_admin,
            firebase_uid: user.firebase_uid || null,
            verified: user.verified || false,
        };

        return generalResponse(res, {
            token: kewozToken,
            user: userData,
        }, 'Login successful', true, false, 200);

    } catch (error) {
        console.error('[Firebase Auth] Unexpected error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return generalResponse(res, {}, 'Duplicate record: ' + (error.errors?.[0]?.message || ''), false, true, 409);
        }
        if (error.name === 'SequelizeValidationError') {
            return generalResponse(res, {}, 'Validation error: ' + (error.errors?.[0]?.message || ''), false, true, 400);
        }
        if (error.name === 'SequelizeForeignKeyConstraintError' || error.name === 'SequelizeDatabaseError') {
            return generalResponse(res, {}, 'Database error', false, true, 503);
        }
        if (error.code && typeof error.code === 'string' && error.code.startsWith('auth/')) {
            return generalResponse(res, {}, 'Firebase auth error: ' + error.message, false, true, 401);
        }
        return generalResponse(res, {}, error.message || 'Internal server error', false, true, 500);
    }
}

module.exports = {
    firebaseVerify,
};
