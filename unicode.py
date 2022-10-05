# -*- coding: utf-8 -*-

import json
from os import remove
from os.path import abspath

from PIL import Image
from selenium.webdriver import Edge
from selenium.webdriver.edge.options import Options


def text2img(browser, name, text, font, emoji, color, size):
    html_content = f"""<html>
        <head>
            <style type="text/css">
                @font-face {{
                    font-family: "Custom";
                    src: url("{font}");
                }}
                @font-face {{
                    font-family: "Emoji";
                    src: url("{emoji}");
                }}
                body {{
                    font-family: Custom, Emoji, Segoe UI, Segoe UI Historic, Segoe UI Emoji, sans-serif;
                    font-size: {size}px;
                    overflow: hidden;
                    line-height: 500px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    text-align: left;
                    color: {color};
                    padding: 0px 20px 0px 20px;
                }}
            </style>
        </head>
        <body>
            <p>{text}</p>
        </body>
    </html>"""

    with open("TEXT.html", "w", encoding="utf-8-sig") as f:
        f.write(html_content)

    browser.get(f'file://{abspath("TEXT.html")}')
    print(f"./{name}.png")
    browser.save_screenshot(f"./{name}.png")


def crop(name):
    img = Image.open(f"./{name}.png")
    x, y = img.size
    i = 0
    while i <= x:
        if sum([img.getpixel((i, k))[-1] for k in range(y)]) != 0:
            break
        i += 1
    j = x - 1
    while j >= 0:
        if sum([img.getpixel((j, k))[-1] for k in range(y)]) != 0:
            break
        j -= 1
    img = img.crop((i, 0) + (j + 1, y))
    img.save(f"./{name}.png")


def main(filename, content, font, color, size):
    browser_options = Options()
    browser_options.add_argument("headless")
    browser = Edge(options=browser_options)
    browser.set_window_size(2560, 500)
    command = f"/session/{browser.session_id}/chromium/send_command_and_get_result"
    url = browser.command_executor._url + command
    data = json.dumps(
        {
            "cmd": "Emulation.setDefaultBackgroundColorOverride",
            "params": {"color": {"r": 0, "g": 0, "b": 0, "a": 0}},
        }
    )
    browser.command_executor._request("POST", url, data)

    emoji_font = abspath("./footage/Noto Emoji.ttf").replace("\\", "/")
    text_font = abspath(font).replace("\\", "/")
    text2img(browser, filename, content, text_font, emoji_font, color, size)
    crop(filename)

    remove("./TEXT.html")
    browser.quit()


if __name__ == "__main__":
    main(
        "test",
        "【𝟒𝐊 𝟔𝟎𝐅𝐏𝐒】这首《𝑭𝒂𝒍𝒍𝒊𝒏𝒈 𝑨𝒈𝒂𝒊𝒏》如今治愈了多少人！！! ℳ₯㎕-沉 沦",
        "./footage/华文圆体粗体_[STYuanBold].ttf",
        "#6D4B2B",
        54,
    )
