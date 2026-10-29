#!/usr/bin/env python3
"""Start the local study server independently of the launcher window."""
import json
import pathlib
import subprocess
import sys
import time
import urllib.request
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parent
URL = 'http://127.0.0.1:5278/'
PROJECT = 'ai-study-website'

def ready():
    try:
        with urllib.request.urlopen(URL + 'health', timeout=1) as response:
            return json.load(response).get('project') == PROJECT
    except Exception:
        return False

def main():
    if not ready():
        logs = ROOT / '.logs'
        logs.mkdir(exist_ok=True)
        with (logs / 'server-macos.log').open('ab') as log:
            process = subprocess.Popen(
                [sys.executable, str(ROOT / 'server.py'), '--no-browser'],
                cwd=str(ROOT), stdin=subprocess.DEVNULL, stdout=log, stderr=log,
                start_new_session=True,
            )
        for _ in range(50):
            if ready():
                break
            if process.poll() is not None:
                print('启动失败，请查看日志：' + str(logs / 'server-macos.log'))
                return 1
            time.sleep(0.1)
        else:
            print('启动超时，请查看日志：' + str(logs / 'server-macos.log'))
            return 1
    print('学习网站已就绪：' + URL)
    print('服务在后台运行，可以关闭启动窗口。重启电脑后请再次双击启动入口。')
    if '--no-browser' not in sys.argv:
        webbrowser.open(URL)
    return 0

if __name__ == '__main__':
    sys.exit(main())
