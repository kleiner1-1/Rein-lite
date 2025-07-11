import axios from 'axios';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) throw `╰⊱❗️⊱ *ACCIÓN MAL USADA* ⊱❗️⊱╮\n\n🍟 *DEBE DE USAR EL COMANDO COMO EN ESTE EJEMPLO:*\n${usedPrefix + command} *tu foto*`

    try {

        m.react('⌛️')

        let songInfo = await spotifyxv(text);
        if (!songInfo.length) throw `No se encontró la canción.`;
        let song = songInfo[0];
        const res = await fetch(`https://apis-starlights-team.koyeb.app/starlight/spotifydl?url=${song.url}`);
        const data = await res.json();
        if (!data || !data.music) throw "No se pudo obtener el enlace de descarga.";

        const info = `🪼 *Titulo:*\n${data.title}\n\n🪩 *Artista:*\n${data.artist}\n\n🦋 *Álbum:*\n${song.album}\n\n⏳ *Duración:*\n${song.duracion}\n\n🔗 *Enlace:*\n${data.spotify}\n\n${wm}`;

        await conn.sendMessage(m.chat, { text: info, contextInfo: { forwardingScore: 9999999, isForwarded: true, 
        externalAdReply: {
            showAdAttribution: true,
            containsAutoReply: true,
            renderLargerThumbnail: true,
            title: 'Spotify Music',
            mediaType: 1,
            thumbnailUrl: data.thumbnail,
            mediaUrl: data.music,
            sourceUrl: data.music
        }}}, { quoted: m });

        await conn.sendMessage(m.chat, { audio: { url: data.music }, fileName: `${data.title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });
        m.react('✅')

    } catch (e1) {
        m.react('❌')
        m.reply(`❌ Ocurrio un error inesperado: ${e1.message || e1}`);
    }
};

handler.command = ['spotify', 'music'];
export default handler;

async function spotifyxv(query) {
    let token = await tokens();
    let response = await axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/search?q=' + encodeURIComponent(query) + '&type=track',
        headers: {
            Authorization: 'Bearer ' + token,
        },
    });
    const tracks = response.data.tracks.items;
    const results = tracks.map((track) => ({
        name: track.name,
        artista: track.artists.map((artist) => artist.name),
        album: track.album.name,
        duracion: timestamp(track.duration_ms),
        url: track.external_urls.spotify,
        imagen: track.album.images.length ? track.album.images[0].url : '',
    }));
    return results;
}

async function tokens() {
    const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from('acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009').toString('base64'),
        },
        data: 'grant_type=client_credentials',
    });
    return response.data.access_token;
}

function timestamp(time) {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

async function getBuffer(url, options) {
    try {
        options = options || {};
        const res = await axios({
            method: 'get',
            url,
            headers: {
                DNT: 1,
                'Upgrade-Insecure-Request': 1,
            },
            ...options,
            responseType: 'arraybuffer',
        });
        return res.data;
    } catch (err) {
        return err;
    }
}

async function getTinyURL(text) {
    try {
        let response = await axios.get(`https://tinyurl.com/api-create.php?url=${text}`);
        return response.data;
    } catch (error) {
        return text;
    }
}