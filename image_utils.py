import Image
from cStringIO import StringIO
import base64 

def combine_b64(top, bottom, x, y):
    a = b64_to_Image(top)
    b = b64_to_Image(bottom)
    return combine(a, b, x, y)

def b64_to_Image(b64_img):
    pic = StringIO()
    img_string = StringIO(base64.b64decode(b64_img))
    img = Image.open(img_string)
    img.save(pic, img.format, quality=100)
    pic.seek(0)
    return Image.open(pic)

def combine(top, bottom, x, y):
   bottom.paste(top, (x, y), top)
   return bottom
