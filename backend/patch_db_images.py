import sqlite3
import os

replacements = {
    'photo-1541888946425-d0fbb180c5f5': 'photo-1544620347-c4fd4a3d5957',
    'photo-1541888946425-d0fbb186156a': 'photo-1544620347-c4fd4a3d5957',
    'photo-1578964777085-78e72765d7fe': 'photo-1578991624414-276ef23a534f',
    'photo-1584463623578-3019313264c7': 'photo-1544620347-c4fd4a3d5957',
    'photo-1517649763962-0c623266ddc0': 'photo-1506521781263-d8422e82f27a',
}

for db_path in ['civicx.db', 'backend/civicx.db']:
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for old_id, new_id in replacements.items():
            cur.execute("UPDATE assets SET image_url = replace(image_url, ?, ?) WHERE image_url LIKE ?", (old_id, new_id, f"%{old_id}%"))
            cur.execute("UPDATE citizen_reports SET photo_url = replace(photo_url, ?, ?) WHERE photo_url LIKE ?", (old_id, new_id, f"%{old_id}%"))
        conn.commit()
        print(f"Patched database: {db_path} (updated rows)")

print("Database patch completed successfully.")
