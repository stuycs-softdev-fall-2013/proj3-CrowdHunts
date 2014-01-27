import Image
from cStringIO import StringIO
import base64 

def combine_b64(top, bottom, x, y):
    a = b64_to_Image(top)
    b = b64_to_Image(bottom)
    return Image_to_b64(combine(a, b, x, y))

def Image_to_b64(img):
    ret = StringIO()
    img.save(ret, img.format)
    ret.seek(0)
    return base64.b64encode(ret.getvalue())

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
