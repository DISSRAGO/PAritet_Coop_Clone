from datetime import datetime

def save_bug(file_path, new_bug):
    with open(file_path, 'a') as file:
        file.write(f"<div class='messagechat'>\n"
                   f"<b>{new_bug}</b>\n"
                   f"<div class='date'>{datetime.now().strftime('%F %d, %Y %I:%M %p')}</div>\n"
                   f".<br>{new_bug}</div>\n")
    print(file.read())

# Example usage
save_bug('bug.txt', "<div class='messagechat'>User: John</div><div class='date'>2023-10-05 14:30</div>")
