# -*- coding: utf-8 -*-

import json
from os.path import abspath
from time import sleep

from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options

text = "✥我҉͛̀̈̈̾̓̀͂̊͝的模҉̖̭̱͍̩͕͓̋̓͋̈̑͋̉͢͞ͅ样吓҈̎̍̅̒̎͂̈́̚͞.到你҈̛́̐̄́̃͗̓͒͒͊̿͛̒了？～❤✥"
font = abspath("./footage/华文圆体粗体_[STYuanBold].ttf").replace("\\", "/")
html_content = f"""<html>
    <head>
        <style type="text/css">
            @font-face {{
                font-family: "HUAWENYUANTI_BOLD";
                src: url("{font}") format("truetype");
                font-weight: normal;
                font-style: normal;
            }}
            p {{
                font-family: -apple-system, HUAWENYUANTI_BOLD, BlinkMacSystemFont, Helvetica Neue, Helvetica, Arial,
                    PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif;
                font-size: 52px;
                word-break: keep-all;
                word-wrap: break-word;
                text-overflow: ellipsis;
                text-align: left;
                color: #6d4b2b;
                padding: 200px 100px 100px 100px;
            }}
        </style>
    </head>
    <body>
        <p>{text}</p>
    </body>
</html>"""

with open("unicode.html", "w", encoding="utf-8-sig") as f:
    f.write(html_content)

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
