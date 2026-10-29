#!/bin/zsh
cd -- "$(dirname -- "$0")" || exit 1
/usr/bin/python3 start-macos.py "$@"
if [ $? -ne 0 ]; then
  echo "启动失败，请把上方提示发给 Codex。按回车关闭。"
  read
fi
