const { Config } = require('../../../models');
const { generalResponse } = require('../../helper/response.helper');

function wrapHtml(title, content) {
    if (!content || content.trim() === '') {
        content = '<p>Contenido no disponible.</p>';
    }
    return '<!DOCTYPE html>\n<html lang=es>\n<head>\n<meta charset=UTF-8>\n<meta name=viewport content=width=device-width, initial-scale=1.0>\n<title>Kewoz - ' + title + '</title>\n<style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;color:#333}h1{color:#111}h2{color:#222}p{margin:1em 0}</style>\n</head>\n<body>\n' + content + '\n</body>\n</html>';
}

async function getPrivacyPolicy(req, res) {
    try {
        const config = await Config.findOne({ order: [['config_id', 'DESC']] });
        const html = wrapHtml('Politica de Privacidad', config ? config.privacy_policy : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    } catch (error) {
        console.error('[Privacy] Error:', error);
        return res.status(500).send('<h1>Error interno del servidor</h1>');
    }
}

async function getTermsConditions(req, res) {
    try {
        const config = await Config.findOne({ order: [['config_id', 'DESC']] });
        const html = wrapHtml('Terminos y Condiciones', config ? config.terms_and_conditions : null);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
    } catch (error) {
        console.error('[Terms] Error:', error);
        return res.status(500).send('<h1>Error interno del servidor</h1>');
    }
}

async function getSupport(req, res) {
    const html = wrapHtml('Soporte', `
        <h1>Soporte de Kewoz</h1>
        <p>Bienvenido al centro de soporte de Kewoz.</p>
        <h2>Contacto</h2>
        <p>Si necesitas ayuda, puedes contactarnos a través de los siguientes medios:</p>
        <ul>
            <li>Email: soporte@kewoz.com</li>
        </ul>
        <h2>Preguntas Frecuentes</h2>
        <p>Pronto estaremos agregando una sección de preguntas frecuentes.</p>
        <p><a href=/>Volver a Kewoz</a></p>
    `);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
}

module.exports = { getPrivacyPolicy, getTermsConditions, getSupport };
