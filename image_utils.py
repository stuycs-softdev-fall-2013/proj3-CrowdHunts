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
    tW = top.size[0]
    tH = top.size[1]
    bW = bottom.size[0]
    bH = bottom.size[1]
    newWidth = x + tW
    newHeight = y + tH
    if newWidth > bW or newHeight > bH:
        ret = Image.new("RGBA", (newWidth, newHeight), (0,0,0,0))
        ret.paste(bottom, (0, 0), bottom)
        ret.paste(top, (x, y), top)
        ret.format = "PNG"
    else:
        bottom.paste(top, (x, y), top)
        ret = bottom
    return ret

def b64_Image_at_loc(b64_img, x, y):
    img = b64_to_Image(b64_img)
    w = img.size[0]+x
    h = img.size[1]+y
    ret = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ret.paste(img, (x, y), img)
    ret.format = "PNG"
    return Image_to_b64(ret)
