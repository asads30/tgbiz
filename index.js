const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql');
const axios = require('axios');
const token = '5842583011:AAExgCjsLtA1JB3c_AnppY46Sq1jR_ow7Qo';
const bot = new TelegramBot(token, {polling: true});

var https = require('https'),     
    http = require('http'),                                           
    Stream = require('stream').Transform,                                  
    fs = require('fs'); 
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/telegrams.locall.ru/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/telegrams.locall.ru/cert.pem', 'utf8');
var ca = fs.readFileSync('/etc/letsencrypt/live/telegrams.locall.ru/chain.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate, ca: ca};

require('dotenv').config();
const express = require("express");
const app = express();
app.use('/static', express.static('photo'));

const { Telegraf  } = require('telegraf');
const tgfTOKEN = '5873001296:AAEU-2u7eCug2AspHy8fdQvHk12H4QFsyow';
const tgfPROVIDER = '390540012:LIVE:29133';
const tgfAPP = 'https://wpaka.uz/';
const tgf = new Telegraf(tgfTOKEN);

var con = mysql.createConnection({
    host: "localhost",
    database: "tgposter",
    user: "root",
    password: "root",
    charset: "utf8mb4_general_ci"
});

con.connect(function(err) {
    if (err) throw err;
});
let currentPost = 0;
bot.on('message', (msg) => {
    const chat_id = msg.chat.id;
    const first_name = msg.from.first_name;
    const user_id = msg.from.id;
    const txt1 = `😊 Привет, ${first_name}! Разреши представиться: я – полезный бот для админа. На меня уже подписано более 1 000 пользователей. И я рад видеть тебя среди них. 😉 Я умею:
    
📍 Создавать товары в твоем телеграм канале
📍 Принимать оплату прямо в Телеграм, если ты продаешь свои товары и услуги
    
Надеюсь, тебе интересно? Тогда добавляй свой канал, чтобы я смог стать и твоим помощником 🚀🚀🚀
    
/add_channel - добавить канал`;
    const txt2 = `☀️ Чтобы я смог сделать твой канал еще круче, тебе нужно выполнить несколько простых действий:

📍 Добавь @tgmbusinessbot в администраторы своего канала
📍 Перешли мне адрес (username) своего канала`;
    const txt3 = `🔥 Отлично, теперь все работает, как часы! Чем займемся? 😉

/add_product - Создать товар
/my_channels - Изменить канал
/my_orders - Мои заказы
/payment - Вывод средств`;
    const txt4 = `✅Я все опубликовал: пост на канале с описанием товара и стоимостью только что вышел. 

Осталось только дождаться покупателей

/add_product - Создать еще товар
/my_channels - Изменить канал
/my_orders - Мои заказы
/payment - Вывод средств`;
    const txt5 = `👌🏻 Давай разнообразим ассортимент твоих товаров!`;
    const txt6 = 'Мне тоже нужна такая штука! 😉 А теперь расскажи о своем товаре подробней. Отправь мне описание, которое смогут прочитать клиенты. 😊 Не забудь: описание должно быть не более 255 символов';
    const txt7 = `👉🏻 Посмотрим, что получилось? 
    
Нажми на кнопку "Предпросмотр" чтобы увидеть, как сообщение будет выглядеть в канале.
        
Если не хочешь тратить время - выбирай публикацию и на твоем канале будет опубликован товар 👌🏻`;
    con.query(`SELECT * FROM users WHERE userid=${msg.from.id}`, function (err, result, fields) {
        const current_user = result[0];
        con.query(`SELECT username FROM channels WHERE userid = ${user_id}`, function (err, result, fields) {
            const current_user_channels = result[0];
            const all_channels = result;
            if(current_user?.id === undefined){
                con.query(`INSERT INTO users (userid, balance) VALUES (?, ?)`, [user_id, 0]);
                bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/01.jpg', {caption: txt1});
            } else if(current_user_channels === undefined){
                if(msg.text == '/add_channel'){
                    con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);
                    bot.sendMessage(chat_id, txt2, {
                        reply_markup: JSON.stringify({
                            hide_keyboard: true
                        })
                    });
                } else {
                    if(current_user.step == 1){
                        let text = msg.text,
                            channel;
                        if ( text.includes('https')) {
                            channel = text.split('https://t.me/').join('@');
                        } else if(text.includes('http')){
                            channel = text.split('http://t.me/').join('@');
                        } else {
                            channel = text;
                        }
                        bot.getChatAdministrators(channel).then(res => {
                            let isAdmin = false;
                            res.forEach(admins => {
                                if(admins.user.id == user_id){
                                    isAdmin = true
                                }
                            });
                            if(isAdmin === true){
                                con.query(`INSERT INTO channels (username, userid) VALUES (?, ?)`, [channel, user_id]);
                                con.query(`UPDATE users SET step = '0' WHERE userid = ${user_id}`);
                                axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
                                bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/02.jpg', {caption: txt3});
                            } else {
                                bot.sendMessage(chat_id, '😕 Извини, но я почему–то не вижу тебя среди админов этого канала. Отправь нам канал где ты являешся администратором или создателем', {
                                    reply_markup: JSON.stringify({
                                        hide_keyboard: true
                                    })
                                });
                            }
                        }).catch(e => {
                            bot.sendMessage(chat_id, '😕 Неправильный формат канала. Отправь нам в формате: @channel или ссылку 1', {
                                reply_markup: JSON.stringify({
                                    hide_keyboard: true
                                })
                            });
                        })
                    } else {
                        bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/01.jpg', {caption: txt1});
                    }
                }
            } else {
                if(msg.text == '/start'){
                    bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/02.jpg', {caption: txt3, reply_markup: {
                        "hide_keyboard": true
                    }});
                } else if(msg.text == '/add_product') {
                    bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/04.jpg', {caption: txt5, reply_markup: {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Начать",
                                    "callback_data": "add_product"            
                                }
                            ]
                        ]
                    }});
                } else if(msg.text == '/payment') {
                    bot.sendMessage(chat_id, `Ваш баланс: ${current_user?.balance}`, {
                        reply_markup: {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Вывести",
                                        "callback_data": "go_payment"            
                                    }
                                ]
                            ],
                            hide_keyboard: true
                        }
                    });
                } else if(msg.text == '/my_orders') {
                    con.query(`SELECT * FROM payments WHERE author = ${user_id}`, function (err, result, fields) {
                        if(result[0]){
                            result.forEach(element => {
                                bot.sendMessage(chat_id, `Платеж №${element.id}, ID поста: ${element.postid}, Цена: ${element.amount/100}`, {
                                    reply_markup: JSON.stringify({
                                        hide_keyboard: true
                                    })
                                })
                            });
                        } else {
                            bot.sendMessage(chat_id, 'Заказов нет', {
                                reply_markup: JSON.stringify({
                                    hide_keyboard: true
                                })
                            })
                        }
                    });
                } else if(msg.text == '/my_channels') {
                    var channels = [];
                    all_channels.forEach(element => {
                        channels.push(element.username)
                    });
                    var my_channels = channels.join(`
`);
                    let text = `☀️ Список ваших подключенных каналов:

${my_channels}`;
                    bot.sendMessage(chat_id, text, {
                        reply_markup: {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Добавить еще",
                                        "callback_data": "add_channel"
                                    }
                                ]
                            ],
                            "hide_keyboard": true
                        }
                    });
                } else{
                    if(current_user.step == 1){
                        let text = msg.text;
                        let channel;
                        if ( text.includes('https')) {
                            channel = text.split('https://t.me/').join('@');
                        } else if(text.includes('http')){
                            channel = text.split('http://t.me/').join('@');
                        } else {
                            channel = text;
                        }
                        bot.getChatAdministrators(channel).then(res => {
                            let isAdmin = false;
                            res.forEach(admins => {
                                if(admins.user.id == user_id){
                                    isAdmin = true
                                }
                            });
                            if(isAdmin === true){
                                con.query(`INSERT INTO channels (username, userid) VALUES (?, ?)`, [channel, user_id]);
                                con.query(`UPDATE users SET step = '0' WHERE userid = ${user_id}`);
                                axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
                                bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/02.jpg', {caption: txt3});
                            } else {
                                bot.sendMessage(chat_id, '😕 Извини, но я почему–то не вижу тебя среди админов этого канала. Отправь нам канал где ты являешся администратором или создателем');
                            }
                        }).catch(e => {
                            console.log(e)
                            bot.sendMessage(chat_id, '😕 Неправильный формат канала. Отправь нам в формате: @channel 2');
                        });
                    } else if(current_user.step == 2) {
                        let text = msg.text;
                        con.query(`UPDATE posts SET title = ? WHERE id = ${currentPost}`, [text]);
                        con.query(`UPDATE users SET step = '2-2' WHERE userid = ${user_id}`);
                        bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/06.jpg', {caption: txt6});
                    } else if(current_user.step == '2-2') {
                        let text = msg.text;
                        con.query(`UPDATE posts SET des = ? WHERE id = ${currentPost}`, [text]);
                        con.query(`UPDATE users SET step = '2-3' WHERE userid = ${user_id}`);
                        bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/07.jpg', {caption: '👍🏻 Отлично! Может быть, добавим фото товара? Загрузи сюда одну самую лучшую фотографию!'});
                    } else if(current_user.step == '2-3') {
                        if(msg.photo){
                            let file_id = msg.photo[2].file_id;
                            let fileid = msg.photo[2].file_unique_id;
                            axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`).then(res => {
                                let file_url = `https://api.telegram.org/file/bot${token}/${res.data.result.file_path}`;
                                con.query(`UPDATE posts SET image = ? WHERE id = ${currentPost}`, [fileid]);
                                https.request(file_url, function(response) {                                        
                                    var data = new Stream();
                                    response.on('data', function(chunk) {                                       
                                    data.push(chunk);                                                         
                                    });
                                    response.on('end', function() {                                             
                                    fs.writeFileSync(`./photo/${fileid}.jpg`, data.read(), 'utf-8');
                                    });
                                }).end();
                                con.query(`UPDATE users SET step = '2-4' WHERE userid = ${user_id}`);
                                bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/08.jpg', {caption: 'А теперь давай расскажем им, сколько это стоит. 👌🏻 Не забудь, что оплата принимается в рублях 😉'});
                            });
                        } else {
                            bot.sendMessage(chat_id, 'Неправильный формат изображения', {
                                reply_markup: JSON.stringify({
                                    hide_keyboard: true
                                })
                            });
                        }
                    } else if(current_user.step == '2-4') {
                        let text = msg.text;
                        bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/09.jpg', {caption: txt7, reply_markup: {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Предпросмотр",
                                        "callback_data": "preview_product"            
                                    }
                                ],
                                [
                                    {
                                        "text": "Опубликовать",
                                        "callback_data": "push_product"            
                                    }
                                ]
                            ],
                            "hide_keyboard": true
                        }});
                        con.query(`UPDATE posts SET price = ? WHERE id = ${currentPost}`, [text]);
                        con.query(`UPDATE users SET step = '0' WHERE userid = ${user_id}`);
                    } else if(current_user.step == '4') {
                        let text = msg.text;
                        con.query(`UPDATE users SET payment = ? WHERE userid = ${user_id}`, [text]);
                        con.query(`UPDATE users SET step = '0' WHERE userid = ${user_id}`);
                        bot.sendMessage(chat_id, `Номер карты сохранен`, {
                            reply_markup: {
                                "inline_keyboard": [
                                    [
                                        {
                                            "text": "Вывести",
                                            "callback_data": "go_payment"            
                                        }
                                    ]
                                ],
                                "hide_keyboard": true
                            }
                        });
                    } else if(current_user.step == '5') {
                        con.query(`UPDATE users SET step = '0' WHERE userid = ${user_id}`);
                        con.query(`SELECT * FROM posts WHERE id=${currentPost}`, function (err, result, fields) {
                            let post = result[0];
                            let payload = currentPost;
                            let token = '381764678:TEST:47448';
                            let prices = [{
                                label: post?.title,
                                amount: 100 * post?.price
                            }]
                            let photo_src = `http://telegrams.locall.ru/static/${post?.image}.jpg`;
                            let text = msg.text;
                            let options = {
                                photo_url: photo_src,
                                photo_width: 960,
                                photo_height: 340,
                                provider_data: '',
                                need_name: true,
                                need_phone_number: true,
                                need_shipping_address: true
                            };
                            bot.sendInvoice(text, post?.title, post?.des, payload, token, "pay", "RUB", prices, options);
                            bot.sendMessage(chat_id, txt4, {
                                reply_markup: JSON.stringify({
                                    hide_keyboard: true
                                })
                            });
                        });
                    } else {
                        bot.sendPhoto(chat_id, 'https://wpaka.uz/photo/02.jpg', {caption: txt3, reply_markup: {
                            "hide_keyboard": true
                        }});
                    }
                }
            } 
        });

    });
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const data = callbackQuery.data;
    const user_id = callbackQuery.from.id;
    const msg = callbackQuery.message;
    const opts = {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
    };
    let text;
    con.query(`SELECT * FROM users WHERE userid=${user_id}`, function (err, result, fields) {
        const current_user = result[0];
        if(data === 'add_product'){
            con.query(`INSERT INTO posts (userid) VALUES (?)`, [user_id], function(err, result, fields) {
                if(!err){
                    con.query(`UPDATE users SET step = 2 WHERE userid = ${user_id}`);
                    currentPost = result.insertId;
                }
            });
            bot.deleteMessage(opts.chat_id, opts.message_id);
            bot.sendPhoto(opts.chat_id, 'https://wpaka.uz/photo/05.jpg', {caption: 'Отправь мне название товара, который хочешь добавить'});
        } else if (data === 'preview_product') {
            bot.deleteMessage(opts.chat_id, opts.message_id);
            con.query(`UPDATE users SET step = 3 WHERE userid = ${user_id}`);
            con.query(`SELECT * FROM posts WHERE id=${currentPost}`, function (err, result, fields) {
                let post = result[0];
                let payload = currentPost;
                let token = '381764678:TEST:47448';
                let prices = [{
                    label: post?.title,
                    amount: 100 * post?.price
                }];
		        let photo_src = `http://telegrams.locall.ru/static/${post?.image}.jpg`;
                let options = {
                    photo_url: photo_src,
	  	            photo_width: 960,
	                photo_height: 340,
 	 	            provider_data: '',
                    need_name: true,
                    need_phone_number: true,
                    need_shipping_address: true
                };
                try {
                    bot.sendInvoice(opts.chat_id, post?.title, post?.des, payload, token, "pay", "RUB", prices, options);
                } catch (error) {
                    console.log(error);
                }
                setTimeout(() => {
                    bot.sendMessage(opts.chat_id, 'Опубликовать', {
                        reply_markup: {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "Да!",
                                        "callback_data": "push_product"            
                                    }
                                ]
                            ]
                        }
                    });
                }, 500);
            });
        } else if (data === 'push_product') {
            bot.deleteMessage(opts.chat_id, opts.message_id);
            con.query(`UPDATE users SET step = 5 WHERE userid = ${user_id}`);
            con.query(`SELECT username FROM channels WHERE userid = ${user_id}`, function (err, result, fields) {
                var channels = [];
                result.forEach(element => {
                    channels.push(element.username)
                });
                bot.sendMessage(opts.chat_id, 'Выберите канал для публикации', {
                    reply_markup: {
                        "keyboard": [
                            channels
                        ],
                        "resize_keyboard": true,
                        "one_time_keyboard": true
                    }
                });
            });
        } else if (data === 'go_payment') {
            if(current_user?.balance > 100 && current_user?.payment != null){
                bot.sendMessage(opts.chat_id, `Ваш баланс: ${current_user?.balance}
  
Номер карты: ${current_user?.payment}`, {
                    reply_markup: {
                        "inline_keyboard": [
                            [
                                {
                                    "text": "Подтверждаю!",
                                    "callback_data": "go_pay"            
                                }
                            ]
                        ]
                    }
                });
            } else if(current_user?.balance > 99 && current_user?.payment === null){
                bot.sendMessage(opts.chat_id, `Введите номер карты`);
                con.query(`UPDATE users SET step = 4 WHERE userid = ${user_id}`);
            } else if(current_user?.balance < 100){
                bot.sendMessage(opts.chat_id, `Баланс ниже 100 рублей`);
            }
        } else if (data === 'go_pay'){
            text = 'Заявка на вывод принята';
            con.query(`UPDATE users SET balance=0 WHERE userid = ${user_id}`);
            bot.editMessageText(text, opts);
        } else if(data === 'add_channel'){
            con.query(`UPDATE users SET step = 1 WHERE userid = ${user_id}`);
            text = `☀️ Чтобы я смог сделать твой канал еще круче, тебе нужно выполнить несколько простых действий:

📍 Добавь @tgmbusinessbot в администраторы своего канала
📍 Перешли мне адрес (username) своего канала`
            bot.editMessageText(text, opts);
        }
    });
});

bot.on('pre_checkout_query', function onCallbackQuery(callbackQuery){
    const postid = callbackQuery.invoice_payload;
    const amount = callbackQuery.total_amount;
    const user_id = callbackQuery.from.id;
    bot.answerPreCheckoutQuery(callbackQuery.id, true);
    con.query(`INSERT INTO payments (postid, amount, userid, status) VALUES (?, ?, ?, ?)`, [postid, amount, user_id, 0])
});

bot.on('successful_payment', function onCallbackQuery(callbackQuery){
  let postid = callbackQuery.successful_payment.invoice_payload;
  const amount = callbackQuery.successful_payment.total_amount / 100;
  con.query(`UPDATE payments SET status = 1 WHERE postid = ${callbackQuery.successful_payment.invoice_payload}`);
  bot.sendMessage('-1001889076042', `Поступил заказ №${callbackQuery.message_id};

от ${callbackQuery.from.first_name} (${callbackQuery.from.id})

Пост: ${callbackQuery.successful_payment.invoice_payload} (${amount} рублей)`);
  con.query(`SELECT * FROM posts WHERE id=${postid}`, function (err, result, fields) {
    const res = result[0];
    const amountPersent = amount*0.9;
    con.query(`UPDATE users SET balance=balance+${amountPersent} WHERE userid = ${res.userid}`);
    bot.sendMessage(res.userid, `Поступил заказ №${callbackQuery.message_id};

от ${callbackQuery.from.first_name} (${callbackQuery.from.id})
    
Пост: ${callbackQuery.successful_payment.invoice_payload} (${amount} рублей)`)
  });
});

app.get('/users', function (req, res) {
    con.query(`SELECT * FROM users`, function (err, result, fields) {
        const users = result;
        res.send(users);
    })
});

app.get('/posts', function (req, res) {
    con.query(`SELECT * FROM posts`, function (err, result, fields) {
        const users = result;
        res.send(users);
    })
});

app.get('/payments', function (req, res) {
    con.query(`SELECT * FROM payments`, function (err, result, fields) {
        const users = result;
        res.send(users);
    })
});

app.post('/web-data', async (req, res) => {
    let senddata = {
      provider_token: tgfPROVIDER,
      start_parameter: 'get_access',
      title: 'Оплата',
      description: 'Интернет магазин',
      currency: 'RUB',
      prices: req.body,
      payload: {
        unique_id: Number(new Date()),
        provider_token: tgfPROVIDER
      },
      need_name: true,
      need_shipping_address: true,
      send_phone_number_to_provider: true
    }
  
    let result = null;
    await axios.post(`https://api.telegram.org/bot${tgfTOKEN}/createInvoiceLink`, senddata).then(response => {
      result = response.data.result;
    });
    res.send(result);
});

tgf.hears('/start', (ctx) => {
    return ctx.telegram.sendMessage(ctx.message.chat.id, `Привет ${ctx.from.first_name}, заходи в наш интернет магазин`, {
      reply_markup: {
          inline_keyboard: [
              [{text: 'Сделать заказ', web_app: {url: tgfAPP}}]
          ]
      }
    })
});
  
tgf.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true)
})
  
tgf.on('successful_payment', async (ctx, next) => {
    await ctx.reply('Оплата успешно прошла! Спасибо!');
    await ctx.telegram.sendMessage(-1001800741022, `Заявки с бота от ТЕСТ`);
});

tgf.launch();

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);
