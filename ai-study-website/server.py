#!/usr/bin/env python3
"""Serve the private study files on this computer only."""
import argparse
import errno
import functools
import http.server
import pathlib
import sys
import urllib.request
import webbrowser
import json

PROJECT_ID = 'ai-study-website'

ROOT = pathlib.Path(__file__).resolve().parent / 'dist'
HOST, PORT = '127.0.0.1', 5278
URL = f'http://{HOST}:{PORT}/'

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] == '/health':
            body = json.dumps({'project': PROJECT_ID, 'status': 'ready'}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and args[1:2] and str(args[1]) not in ('200', '304'):
            super().log_message(fmt, *args)

def main():
    parser = argparse.ArgumentParser(description='启动本机 AI 学习网站')
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    try:
        server = http.server.ThreadingHTTPServer((HOST, PORT), functools.partial(Handler, directory=str(ROOT)))
    except OSError as err:
        if err.errno in (errno.EPERM, errno.EACCES):
            print(f'系统限制了本机服务启动：{err}')
            return 1
        try:
            request = urllib.request.Request(URL, headers={'Cache-Control': 'no-cache'})
            with urllib.request.urlopen(request, timeout=3) as response:
                html = response.read(20000).decode('utf-8')
            if 'data-app="python-study"' not in html:
                raise ValueError('该端口被其他程序占用')
        except Exception:
            print(f'启动失败：{err}\n端口 {PORT} 被占用，请关闭占用该端口的程序后重试。')
            return 1
        print('学习网站已运行：' + URL, flush=True)
        if not args.no_browser:
            webbrowser.open(URL)
        return 0
    print('AI 学习网站已启动：' + URL, flush=True)
    print('本机服务就绪。Windows 启动器会在后台保持服务运行。', flush=True)
    if not args.no_browser:
        webbrowser.open(URL)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n网站已停止，学习记录仍保存在浏览器中。')
    finally:
        server.server_close()
    return 0

if __name__ == '__main__':
    sys.exit(main())
