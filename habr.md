# Очередная node.js библиотека…

Думаю, мы можем опять обнулить счетчик времени появления очередной JS библиотеки.

Все началось примерно 6 лет назад, когда я познакомился с [node.js](https://nodejs.org/).
Около 3 лет назад я начал использовать node.js на проектах 
вместе с замечательной библиотекой [express.js](https://ru.wikipedia.org/wiki/Express.js) 
(на wiki он назван каркасом приложений, 
хотя некоторые могут называть его фреймворком или даже пакетом). 
Она сочетает в себе node.js http сервер и систему промежуточного ПО, 
созданную по образу каркаса [Sinatra](http://www.sinatrarb.com/intro-ru.html) из Ruby.  

Все мы знаем о скорости создания новых библиотек и скорости развития JS. 
После эпизода разделения и объединения с IO.js node.js взяла себе лучшее из мира JS - ES6, 
а в апреле и ES7.

Об одном из этих изменений и хочу поговорить. 
А конкретно о [async / await](https://habrahabr.ru/post/282477/) 
и [Promise](https://habrahabr.ru/post/209662/). 
Пытаясь использовать Promise в проектах на express, 
а после и async / await с флагом для [node.js 7](https://habrahabr.ru/post/313658/) --harmony, 
я наткнулся на интересный [фреймворк нового поколения](https://habrahabr.ru/post/301126/) - koa.js, 
а конкретно на его [вторую версию](https://github.com/koajs/koa/tree/v2.x).

Первая версия была создана с помощью [генераторов](https://habrahabr.ru/post/277033/) 
и библиотеки [CO](https://github.com/tj/co). 
Вторая версия обещает удобство при работе с Promise / async / await 
и ждет апрельского релиза node.js с поддержкой этих возможностей без флагов.

Мне стало интересно заглянуть в [ядро koa](https://github.com/koajs/compose/tree/next) и узнать, 
как реализована работа с Promise. 
Но я был удивлен, т.к. ядро осталось практически таким же, как в предыдущей версии. 
Авторы обеих библиотек express и koa одни и те же, неудивительно, что и подход остался таким же. 
Я имею ввиду структуру промежуточного ПО. 
Использовать подход из Ruby было полезно на этапе становления node.js, но современный node.js, 
как и JS, имеет свои преимущества, красоту, элегантность...

Немного теории:

Node.js [http](https://nodejs.org/api/http.html#http_class_http_server) 
([https](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener)) 
сервер наследует [net.Server](https://nodejs.org/api/net.html#net_class_net_server), 
который реализовывает [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter). 
И все библиотеки (express, koa...) по сути являются обработчиками события 
[server.on('request')](https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/). 
Например:

    const http = require('http');
    
    const server = http.createServer((request, response) => {
      // обработка события
    });
    
Или

    const server = http.createServer();
    
    server.on('request', (request, response) => {
      // такая же обработка события
    });

И я представил, как должен выглядеть действительно "фреймворк нового поколения":

    const server = http.createServer( (req, res) => {
      Promise.resolve({ req, res }).then(ctx => {
    
            ctx.res.writeHead(200, {'Content-Type': 'text/plain'});
            ctx.res.end('OK');
    
            return ctx;
        });
    });

Это дает отличную возможность избавиться от [callback hell](https://habrahabr.ru/post/319094/) 
и постоянной обработки ошибок на всех уровнях, как, например, реализовано в express. 
Также, это позволяет применить 
[Promise.all()](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) 
для "параллельного" выполнения [промежуточного ПО (middleware)](http://expressjs.com/ru/guide/using-middleware.html) 
вместо последовательного. 

И так появилась еще одна библиотека: [YEPS](https://github.com/evheniy/yeps) - Yet Another Event Promised Server.

Синтаксис YEPS передает всю простоту и элегантность архитектуры, основанной на обещаниях 
(promise based design), например, параллельная обработка промежуточного ПО:

    const App = require('yeps');
    const app = new App();
    const error = require('yeps-error');
    const logger = require('yeps-logger');
    
    app.all([
        logger(),
        error()
    ]);
    
    app.then(async ctx => {
        ctx.res.writeHead(200, {'Content-Type': 'text/plain'});
        ctx.res.end('Ok');
    });
    
    app.catch(async (err, ctx) => {
        ctx.res.writeHead(500);
        ctx.res.end(err.message);
    });
    
Или

    app.all([
        logger(),
        error()
    ]).then(async ctx => {
        ctx.res.writeHead(200, {'Content-Type': 'text/plain'});
        ctx.res.end('Ok');
    }).catch(async (err, ctx) => {
        ctx.res.writeHead(500);
        ctx.res.end(err.message);
    });

Для примера есть пакеты [error](https://github.com/evheniy/yeps-error), 
[logger](https://github.com/evheniy/yeps-logger), [redis](https://github.com/evheniy/yeps-redis).

Но самым удивительным была скорость работы. 
Можно запустить сравнительный тест производительности - [yeps-benchmark](https://github.com/evheniy/yeps-benchmark), 
где сравнивается производительность работы [YEPS](https://raw.githubusercontent.com/evheniy/yeps-benchmark/master/reports/yeps_middleware.txt) с 
[express](https://raw.githubusercontent.com/evheniy/yeps-benchmark/master/reports/express_middleware.txt), 
[koa2](https://raw.githubusercontent.com/evheniy/yeps-benchmark/master/reports/koa2_middleware.txt) 
и даже [node.js http](https://raw.githubusercontent.com/evheniy/yeps-benchmark/master/reports/http_middleware.txt).

Как видим, параллельное выполнение показывает интересные результаты. 
Хотя этого можно достичь в любом проекте, этот подход должен быть заложен в архитектуру, 
в саму идею - не делать ни одного шага без тестирования производительности. 
Например, ядро библиотеки - [yeps-promisify](https://github.com/evheniy/yeps-promisify), 
использует array.slice(0) - наиболее 
[быстрый метод копирования массива](http://stackoverflow.com/questions/3978492/javascript-fastest-way-to-duplicate-an-array-slice-vs-for-loop).

Идея параллельного выполнения промежуточного ПО натолкнула на идею создания 
маршрутизатора (router, роутер), полностью созданного на Promise.all(). 
Сама идея поймать (catch) нужный маршрут (route), нужное правило и соответственно 
вернуть нужный обработчик лежит в основе Promise.all().

    const Router = require('yeps-router');
    const router = new Router();
    
    router.get('/').then(async ctx => {
        ctx.res.writeHead(200);
        ctx.res.end('homepage');     
    }).post('/test/:id').then(async ctx => {
        ctx.res.writeHead(200);
        ctx.res.end(ctx.request.params.id);
    });

Вместо последовательного перебора всех правил можно одновременно  запустить проверку всех. 
Этот момент не остался без тестирования производительности и 
[результаты](https://github.com/evheniy/yeps-benchmark) не заставили себя ждать.

Поиск [первого](https://raw.githubusercontent.com/evheniy/yeps-benchmark/master/reports/yeps_route_first.txt) 
правила был на примерно 10% быстрее. 
[Последнее](https://raw.githubusercontent.com/evheniy/yeps-benchmark/master/reports/yeps_route_last.txt) 
правило срабатывало ровно с той же скоростью, что примерно в 4 раза быстрее остальных библиотек 
(здесь речь идет о 10 маршрутах). 
Больше не нужно собирать и анализировать статистику, думать какое правило поднять вверх,. 

Но для полноценной production ready работы необходимо было решить проблему 
"[курицы и яйца](https://ru.wikipedia.org/wiki/%D0%9F%D1%80%D0%BE%D0%B1%D0%BB%D0%B5%D0%BC%D0%B0_%D0%BA%D1%83%D1%80%D0%B8%D1%86%D1%8B_%D0%B8_%D1%8F%D0%B9%D1%86%D0%B0)" - никто 
не будет использовать библиотеку без дополнительных пакетов, 
и никто не будет писать пакеты к неиспользуемой библиотеке. 
Здесь помогла [обертка](https://github.com/evheniy/yeps-express-wrapper) (wrapper), 
позволяющая использовать промежуточное ПО от express, 
например [body-parser](https://github.com/expressjs/body-parser) или 
[serve-favicon](https://github.com/expressjs/serve-favicon)... 

    const error = require('yeps-error');
    const wrapper = require('yeps-express-wrapper');
    
    const bodyParser = require('body-parser');
    const favicon = require('serve-favicon');
    const path = require('path');
    
    app.then(
        wrapper(favicon(path.join(__dirname, 'public', 'favicon.ico')))
    ).all([
        error(),
        wrapper(bodyParser.json()),
    ]);

Так же есть шаблон приложения - [yeps-boilerplate](https://github.com/evheniy/yeps-boilerplate), 
позволяющий запустить новое приложение, просмотреть код, примеры…

Надеюсь это исследование и результат будет полезен, 
может даже даже вдохновит на создание красивых, быстрых, возможно даже элегантных решений. 
И конечно же идея тестировать производительность каждого шага должна лечь в основу 
любого нового и существующего проекта.

P.S.: Надеюсь на советы, идеи и конструктивную критику в комментариях.



