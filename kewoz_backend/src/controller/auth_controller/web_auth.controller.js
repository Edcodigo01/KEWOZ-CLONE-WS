const { User } = require('../../../models');
const { generateToken } = require('../../service/common/token.service');
const { generalResponse } = require('../../helper/response.helper');
const { isAdminOtpPattern } = require('../../helper/adminUser.helper');

async function webLogin(req, res) {
    try {
        const { email, mobile_num, country_code, otp } = req.body;
        const platform = req.body.platform || 'web';

        if (!email && !mobile_num) {
            return generalResponse(res, {}, 'email or mobile_num is required', false, true, 400);
        }

        // ── Admin-OTP path: allow login by (country_code + mobile_num) with OTP 123456 ──
        if (!email && mobile_num) {
            const isAdminOtp = isAdminOtpPattern(country_code, mobile_num);
            if (isAdminOtp) {
                const user = await User.findOne({ where: { mobile_num, country_code: country_code || '' } });
                if (!user) {
                    return generalResponse(res, {}, 'Usuario no encontrado', false, true, 404);
                }
                if (String(otp) !== '123456') {
                    return generalResponse(res, {}, 'Ingrese OTP de usuario creado por admin', false, true, 400);
                }
                // Mark verified, add web platform
                const existing = Array.isArray(user.platforms) ? user.platforms : [];
                if (!existing.includes('web')) {
                    existing.push('web');
                }
                await user.update({
                    platforms: existing,
                    login_verification_status: true,
                    otp: 0,
                    is_admin_otp_user: true,
                });
                const token = generateToken({
                    user_id: user.user_id,
                    email: user.email,
                    user_name: user.user_name,
                    login_type: 'phone',
                });
                return generalResponse(res, {
                    token,
                    user: {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        user_name: user.user_name,
                        email: user.email,
                        mobile_num: user.mobile_num,
                        country_code: user.country_code,
                        profile_pic: user.profile_pic,
                        login_type: 'phone',
                    },
                }, 'Login successful', true, false, 200);
            }
        }

        const where = email ? { email } : { mobile_num, country_code: country_code || '' };
        let user = await User.findOne({ where });

        if (!user) {
            return generalResponse(res, {}, 'Debe registrar el correo en su usuario en el teléfono para poder iniciar sesión en la web', false, true, 400);
        } else {
            const existing = Array.isArray(user.platforms) ? user.platforms : [];
            if (!existing.includes('web')) {
                existing.push('web');
                await user.update({ platforms: existing });
            }
            if (!user.login_verification_status) {
                await user.update({ login_verification_status: true });
            }
            console.log('[Web Auth] Existing user:', user.user_id);
        }

        const token = generateToken({
            user_id: user.user_id,
            email: user.email,
            login_type: 'email',
        });

        return generalResponse(res, {
            token,
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                user_name: user.user_name,
                email: user.email,
                mobile_num: user.mobile_num,
                country_code: user.country_code,
                profile_pic: user.profile_pic,
                login_type: 'email',
            },
        }, 'Login successful', true, false, 200);
    } catch (error) {
        console.error('[Web Auth] Error:', error);
        return generalResponse(res, {}, error.message, false, true, 500);
    }
}

module.exports = { webLogin };
