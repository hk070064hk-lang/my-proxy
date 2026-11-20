export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    // 1. ?url= が指定されていない場合は、操作用のUI（HTML画面）を表示する
    if (!targetUrl) {
      const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Web Proxy</title>
        <style>
          body {
            font-family: sans-serif;
            background: #0f172a;
            color: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .box {
            background: #1e293b;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            width: 90%;
            max-width: 450px;
            text-align: center;
          }
          h1 { margin-top: 0; font-size: 1.5rem; color: #38bdf8; }
          input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #334155;
            border-radius: 6px;
            background: #0f172a;
            color: white;
            box-sizing: border-box;
          }
          button {
            width: 100%;
            padding: 12px;
            background: #0284c7;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
          }
          button:hover { background: #0369a1; }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>🚀 Web Proxy</h1>
          <form method="GET" action="/">
            <input type="password" name="key" placeholder="パスワードを入力" required>
            <input type="url" name="url" placeholder="https://example.com" required>
            <button type="submit">アクセスする</button>
          </form>
        </div>
      </body>
      </html>
      `;
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=UTF-8" }
      });
    }

    // 2. パスワードチェック（ここを好きな合言葉に変えてください）
    const secretKey = env.SECRET_KEY || "my-secret-123";
    if (url.searchParams.get("key") !== secretKey) {
      return new Response("アクセス拒否: パスワードが違います", { status: 403 });
    }

    // 3. プロキシ通信の実行
    try {
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: {
          "User-Agent": request.headers.get("User-Agent") || "Mozilla/5.0"
        },
        redirect: "follow"
      });

      const response = await fetch(modifiedRequest);
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });

    } catch (err) {
      return new Response("エラー: サイトを読み込めませんでした (" + err.message + ")", { status: 500 });
    }
  }
};
