# -*- coding: utf-8 -*-

import json
from os.path import abspath
from time import sleep

from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options

browser_options = Options()
browser_options.add_argument("--headless")

browser = Chrome(options=browser_options)
browser.set_window_size(1920, 1080)
command = f"/session/{browser.session_id}/chromium/send_command_and_get_result"
url = browser.command_executor._url + command
data = json.dumps(
    {
        "cmd": "Emulation.setDefaultBackgroundColorOverride",
        "params": {"color": {"r": 0, "g": 0, "b": 0, "a": 0}},
    }
)
response = browser.command_executor._request("POST", url, data)
browser.get(f'file://{abspath("unicode.html")}')
sleep(1)
browser.save_screenshot("unicode_text.png")
browser.quit()
