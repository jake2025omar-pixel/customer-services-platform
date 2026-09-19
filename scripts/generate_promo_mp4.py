import os
import subprocess
import shutil

OUTPUT_DIR = "/tmp/promo_scenes"
FINAL_VIDEO = "/app/applet/client/public/sayool_customer_services_promo.mp4"
FALLBACK_VIDEO = "/app/applet/client/public/promo_video.mp4"
BOT_IMAGE = "/app/applet/client/src/assets/store_order_bot.jpg"
FONT_TITLE = "/usr/share/fonts/truetype/kacst/KacstTitle.ttf"
FONT_BODY = "/usr/share/fonts/truetype/kacst/KacstBook.ttf"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(os.path.dirname(FINAL_VIDEO), exist_ok=True)

# Helper to generate a slide video
def render_slide(index, duration, filter_str, overlay_img=None):
    out_path = os.path.join(OUTPUT_DIR, f"scene_{index}.mp4")
    cmd = ["ffmpeg", "-y", "-f", "lavfi", "-i", f"color=c=#08101c:s=1280x720:d={duration}"]
    
    if overlay_img and os.path.exists(overlay_img):
        cmd.extend(["-i", overlay_img, "-filter_complex", filter_str])
    else:
        cmd.extend(["-vf", filter_str])
        
    cmd.extend(["-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "25", out_path])
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error generating scene {index}:", res.stderr[-400:])
        raise RuntimeError(f"Scene {index} failed")
    print(f"Scene {index} done: {out_path}")
    return out_path

# 1. Scene 1: Intro
f1 = (
    "drawbox=x=60:y=40:w=1160:h=640:color=#CCFF00@0.2:t=3,"
    "drawbox=x=80:y=60:w=1120:h=600:color=#11131c:t=fill,"
    "drawbox=x=400:y=90:w=480:h=48:color=#CCFF00:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='✦ CUSTOMER SERVICES × SAYOOL 2026 ✦':fontcolor=black:fontsize=22:x=(w-text_w)/2:y=104,"
    f"drawtext=fontfile={FONT_TITLE}:text='منصة خدمة العملاء وسيول الرقمية':fontcolor=#CCFF00:fontsize=52:x=(w-text_w)/2:y=185,"
    f"drawtext=fontfile={FONT_BODY}:text='بوابتك الأولى للخدمات والمسابقات الكبرى والربح المجاني':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=270,"
    "drawbox=x=140:y=340:w=1000:h=180:color=#181c28:t=fill,"
    "drawbox=x=140:y=340:w=1000:h=180:color=#CCFF00@0.5:t=2,"
    f"drawtext=fontfile={FONT_TITLE}:text='دعم الدفع المباشر عبر Payoneer ومحفظة OKX USDT في اليمن وجميع الدول':fontcolor=#CCFF00:fontsize=26:x=(w-text_w)/2:y=380,"
    f"drawtext=fontfile={FONT_BODY}:text='خدمات برمجية وتسويقية احترافية  •  سحوبات دورية موثقة  •  نقاط مكافآت مجانية':fontcolor=white:fontsize=23:x=(w-text_w)/2:y=450,"
    "drawbox=x=440:y=560:w=400:h=50:color=#0066FF:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='موثق ومعتمد 100% لعام 2026':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=574"
)
render_slide(1, 8, f1)

# 2. Scene 2: Tech Local
f2 = (
    "drawbox=x=60:y=40:w=1160:h=640:color=#0066FF@0.3:t=3,"
    "drawbox=x=80:y=60:w=1120:h=600:color=#11131c:t=fill,"
    "drawbox=x=420:y=90:w=440:h=48:color=#0066FF:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='✦ 01 / TECH LOCAL OVERVIEW ✦':fontcolor=white:fontsize=22:x=(w-text_w)/2:y=104,"
    f"drawtext=fontfile={FONT_TITLE}:text='القسم الأول: تيك محلي (لوحة القيادة)':fontcolor=#0066FF:fontsize=48:x=(w-text_w)/2:y=175,"
    f"drawtext=fontfile={FONT_BODY}:text='متابعة رصيد النقاط والطلبات والإحصائيات الحية لحظة بلحظة':fontcolor=white:fontsize=26:x=(w-text_w)/2:y=255,"
    "drawbox=x=120:y=330:w=230:h=170:color=#181c28:t=fill,"
    "drawbox=x=120:y=330:w=230:h=170:color=#CCFF00:t=2,"
    f"drawtext=fontfile={FONT_BODY}:text='رصيد النقاط':fontcolor=white:fontsize=22:x=180:y=360,"
    f"drawtext=fontfile={FONT_TITLE}:text='1250 PTS':fontcolor=#CCFF00:fontsize=36:x=145:y=425,"
    "drawbox=x=380:y=330:w=230:h=170:color=#181c28:t=fill,"
    "drawbox=x=380:y=330:w=230:h=170:color=white:t=2,"
    f"drawtext=fontfile={FONT_BODY}:text='تذاكر المسابقة':fontcolor=white:fontsize=22:x=435:y=360,"
    f"drawtext=fontfile={FONT_TITLE}:text='25 تذكرة':fontcolor=white:fontsize=36:x=425:y=425,"
    "drawbox=x=640:y=330:w=230:h=170:color=#181c28:t=fill,"
    "drawbox=x=640:y=330:w=230:h=170:color=#00D2FF:t=2,"
    f"drawtext=fontfile={FONT_BODY}:text='الخدمات النشطة':fontcolor=white:fontsize=22:x=690:y=360,"
    f"drawtext=fontfile={FONT_TITLE}:text='7 خدمات':fontcolor=#00D2FF:fontsize=36:x=690:y=425,"
    "drawbox=x=900:y=330:w=230:h=170:color=#181c28:t=fill,"
    "drawbox=x=900:y=330:w=230:h=170:color=#00E676:t=2,"
    f"drawtext=fontfile={FONT_BODY}:text='حالة الحساب':fontcolor=white:fontsize=22:x=960:y=360,"
    f"drawtext=fontfile={FONT_TITLE}:text='موثق 100%':fontcolor=#00E676:fontsize=34:x=925:y=425,"
    f"drawtext=fontfile={FONT_BODY}:text='تحديث فوري لكل العمليات دون أي تأخير مع أعلى معايير الخصوصية والأمان':fontcolor=#94A3B8:fontsize=22:x=(w-text_w)/2:y=560"
)
render_slide(2, 8, f2)

# 3. Scene 3: Contests
f3 = (
    "drawbox=x=60:y=40:w=1160:h=640:color=#FF3B00@0.3:t=3,"
    "drawbox=x=80:y=60:w=1120:h=600:color=#11131c:t=fill,"
    "drawbox=x=420:y=90:w=440:h=48:color=#FF3B00:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='✦ 02 / CONTESTS & PRIZES ✦':fontcolor=white:fontsize=22:x=(w-text_w)/2:y=104,"
    f"drawtext=fontfile={FONT_TITLE}:text='القسم الثاني: المسابقات والجوائز الكبرى':fontcolor=#FF3B00:fontsize=48:x=(w-text_w)/2:y=175,"
    f"drawtext=fontfile={FONT_BODY}:text='سحوبات نزيهة وموثقة على جوائز نقدية كبرى عبر بايونير أو USDT':fontcolor=white:fontsize=26:x=(w-text_w)/2:y=255,"
    "drawbox=x=160:y=320:w=960:h=230:color=#FF3B00:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='الجائزة الكبرى النشطة: 500$ نقدا':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=355,"
    f"drawtext=fontfile={FONT_BODY}:text='الدفع المباشر عبر Payoneer أو محفظة USDT TRC20 المشفرة':fontcolor=#FEF08A:fontsize=26:x=(w-text_w)/2:y=425,"
    "drawbox=x=220:y=475:w=840:h=50:color=black@0.4:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='50 نقطة = 1 تذكرة سحب  •  سحب نزيه ومشفر متاح للجميع في اليمن والعالم':fontcolor=white:fontsize=22:x=(w-text_w)/2:y=490,"
    f"drawtext=fontfile={FONT_BODY}:text='كلما جمعت تذاكر أكثر كلما تضاعفت فرصك بالفوز بالجوائز النقدية':fontcolor=#94A3B8:fontsize=22:x=(w-text_w)/2:y=590"
)
render_slide(3, 8, f3)

# 4. Scene 4: Rewarded Ads
f4 = (
    "drawbox=x=60:y=40:w=1160:h=640:color=#EC4899@0.3:t=3,"
    "drawbox=x=80:y=60:w=1120:h=600:color=#11131c:t=fill,"
    "drawbox=x=420:y=90:w=440:h=48:color=#EC4899:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='✦ 03 / REWARDED ADS ✦':fontcolor=black:fontsize=22:x=(w-text_w)/2:y=104,"
    f"drawtext=fontfile={FONT_TITLE}:text='القسم الثالث: المكافآت والإعلانات':fontcolor=#EC4899:fontsize=48:x=(w-text_w)/2:y=175,"
    f"drawtext=fontfile={FONT_BODY}:text='منجم الذهب لكسب مئات النقاط مجانا وبدون دفع أي قرش':fontcolor=white:fontsize=26:x=(w-text_w)/2:y=255,"
    "drawbox=x=180:y=330:w=920:h=210:color=#EC4899:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='شاهد إعلانات تفاعلية واكسب 50 نقطة لكل إعلان':fontcolor=black:fontsize=36:x=(w-text_w)/2:y=365,"
    f"drawtext=fontfile={FONT_BODY}:text='رصيد نقاط فوري ومباشر يودع في محفظتك بدون أي فترات انتظار':fontcolor=#18181B:fontsize=25:x=(w-text_w)/2:y=430,"
    "drawbox=x=240:y=475:w=800:h=45:color=black:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='مجاني 100%  •  بدون أي رسوم  •  اكسب حتى 1000+ نقطة يوميا':fontcolor=#CCFF00:fontsize=22:x=(w-text_w)/2:y=488,"
    f"drawtext=fontfile={FONT_BODY}:text='استبدل نقاطك المجانية لاحقا بخدمات رقمية حقيقية أو تذاكر مسابقات':fontcolor=#94A3B8:fontsize=22:x=(w-text_w)/2:y=580"
)
render_slide(4, 8, f4)

# 5. Scene 5: Sayool Services Catalog (with real bot image overlay)
f5 = (
    "[1:v]scale=230:230,drawbox=x=0:y=0:w=230:h=230:color=black:t=4[bot];"
    "[0:v]drawbox=x=60:y=40:w=1160:h=640:color=#FACC15@0.3:t=3,"
    "drawbox=x=80:y=60:w=1120:h=600:color=#11131c:t=fill,"
    "drawbox=x=420:y=90:w=440:h=48:color=#FACC15:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='✦ 04 / DIGITAL SERVICES ✦':fontcolor=black:fontsize=22:x=(w-text_w)/2:y=104,"
    f"drawtext=fontfile={FONT_TITLE}:text='القسم الرابع: كتالوج خدمات سيول الرقمية':fontcolor=#FACC15:fontsize=46:x=(w-text_w)/2:y=175,"
    f"drawtext=fontfile={FONT_BODY}:text='باقة متكاملة من أرقى الخدمات البرمجية والتسويقية الحصرية':fontcolor=white:fontsize=26:x=(w-text_w)/2:y=250[bg];"
    "[bg][bot]overlay=130:315[v1];"
    "[v1]drawbox=x=380:y=315:w=750:h=230:color=#FACC15:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='بوت استلام طلبات المتاجر الذكي (الخدمة المميزة)':fontcolor=black:fontsize=30:x=405:y=335,"
    f"drawtext=fontfile={FONT_BODY}:text='أتمتة كاملة للطلبات وإصدار الفواتير التلقائية وإرسال إشعارات التوصيل':fontcolor=#18181B:fontsize=21:x=405:y=395,"
    f"drawtext=fontfile={FONT_BODY}:text='ربط مباشر مع متجرك على تيليجرام وواتساب بدون تعقيد برمجيات':fontcolor=#27272A:fontsize=21:x=405:y=435,"
    "drawbox=x=405:y=480:w=700:h=48:color=black:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='السعر: 45$ نقدا  أو  2200 نقطة مجانية بالكامل':fontcolor=#FACC15:fontsize=23:x=480:y=493,"
    f"drawtext=fontfile={FONT_BODY}:text='خدمات أخرى: زيادة متابعين حقيقيين  •  تصميم الهويات  •  المواقع السحابية':fontcolor=#94A3B8:fontsize=22:x=(w-text_w)/2:y=590"
)
render_slide(5, 9, f5, BOT_IMAGE)

# 6. Scene 6: How to claim for free
f6 = (
    "drawbox=x=60:y=40:w=1160:h=640:color=#CCFF00@0.3:t=3,"
    "drawbox=x=80:y=60:w=1120:h=600:color=#11131c:t=fill,"
    "drawbox=x=380:y=80:w=520:h=48:color=#CCFF00:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='✦ 05 / HOW TO CLAIM FOR FREE ✦':fontcolor=black:fontsize=22:x=(w-text_w)/2:y=94,"
    f"drawtext=fontfile={FONT_TITLE}:text='كيف تكسب وتستلم خدمتك مجانا؟ (4 خطوات)':fontcolor=#CCFF00:fontsize=44:x=(w-text_w)/2:y=160,"
    f"drawtext=fontfile={FONT_BODY}:text='الدليل العملي: من البداية حتى استلام خدمتك بدون دفع أي مبلغ مالي!':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=225,"
    "drawbox=x=120:y=270:w=490:h=120:color=#181c28:t=fill,"
    "drawbox=x=120:y=270:w=490:h=120:color=#CCFF00:t=2,"
    "drawbox=x=140:y=290:w=40:h=40:color=#CCFF00:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='1':fontcolor=black:fontsize=26:x=152:y=296,"
    f"drawtext=fontfile={FONT_TITLE}:text='تسجيل الدخول السريع':fontcolor=white:fontsize=22:x=200:y=295,"
    f"drawtext=fontfile={FONT_BODY}:text='سجل بنقرة واحدة بحسابك في Google بأمان':fontcolor=#94A3B8:fontsize=18:x=200:y=340,"
    "drawbox=x=670:y=270:w=490:h=120:color=#181c28:t=fill,"
    "drawbox=x=670:y=270:w=490:h=120:color=#EC4899:t=2,"
    "drawbox=x=690:y=290:w=40:h=40:color=#EC4899:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='2':fontcolor=black:fontsize=26:x=702:y=296,"
    f"drawtext=fontfile={FONT_TITLE}:text='اجمع النقاط مجانا':fontcolor=white:fontsize=22:x=750:y=295,"
    f"drawtext=fontfile={FONT_BODY}:text='شاهد إعلانات قسم المكافآت واكسب 50 نقطة لكل إعلان':fontcolor=#94A3B8:fontsize=18:x=750:y=340,"
    "drawbox=x=120:y=410:w=490:h=120:color=#181c28:t=fill,"
    "drawbox=x=120:y=410:w=490:h=120:color=#FACC15:t=2,"
    "drawbox=x=140:y=430:w=40:h=40:color=#FACC15:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='3':fontcolor=black:fontsize=26:x=152:y=436,"
    f"drawtext=fontfile={FONT_TITLE}:text='اختر خدمتك من سيول':fontcolor=white:fontsize=22:x=200:y=435,"
    f"drawtext=fontfile={FONT_BODY}:text='اختر البوت أو التصميم أو المتابعين واضغط طلب الخدمة':fontcolor=#94A3B8:fontsize=18:x=200:y=480,"
    "drawbox=x=670:y=410:w=490:h=120:color=#181c28:t=fill,"
    "drawbox=x=670:y=410:w=490:h=120:color=#0066FF:t=2,"
    "drawbox=x=690:y=430:w=40:h=40:color=#0066FF:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='4':fontcolor=white:fontsize=26:x=702:y=436,"
    f"drawtext=fontfile={FONT_TITLE}:text='الدفع بالنقاط والاستلام':fontcolor=white:fontsize=22:x=750:y=435,"
    f"drawtext=fontfile={FONT_BODY}:text='ضع رقمك واتساب أو تيليجرام واستلم خدمتك بدون دفع فلس':fontcolor=#94A3B8:fontsize=18:x=750:y=480,"
    "drawbox=x=180:y=560:w=920:h=50:color=#CCFF00@0.15:t=fill,"
    "drawbox=x=180:y=560:w=920:h=50:color=#CCFF00:t=1,"
    f"drawtext=fontfile={FONT_TITLE}:text='متاح أيضا الشراء المباشر بالدولار عبر Payoneer أو USDT عند الرغبة':fontcolor=#CCFF00:fontsize=22:x=(w-text_w)/2:y=574"
)
render_slide(6, 10, f6)

# 7. Scene 7: CTA
f7 = (
    "drawbox=x=60:y=40:w=1160:h=640:color=#CCFF00@0.3:t=3,"
    "drawbox=x=80:y=60:w=1120:h=600:color=#11131c:t=fill,"
    "drawbox=x=440:y=90:w=400:h=48:color=#CCFF00:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='✦ 06 / JOIN US TODAY ✦':fontcolor=black:fontsize=22:x=(w-text_w)/2:y=104,"
    f"drawtext=fontfile={FONT_TITLE}:text='انضم إلينا اليوم وابدأ بجمع أولى نقاطك!':fontcolor=#CCFF00:fontsize=48:x=(w-text_w)/2:y=180,"
    f"drawtext=fontfile={FONT_BODY}:text='منصة خدمة العملاء وسيول - شريكك الموثوق للتفوق الرقمي':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=265,"
    "drawbox=x=220:y=340:w=840:h=180:color=#181c28:t=fill,"
    "drawbox=x=220:y=340:w=840:h=180:color=white:t=2,"
    f"drawtext=fontfile={FONT_TITLE}:text='سجل دخولك الآن واستمتع بجميع المزايا مجانا':fontcolor=white:fontsize=32:x=(w-text_w)/2:y=380,"
    f"drawtext=fontfile={FONT_BODY}:text='مسابقات مستمرة  •  هدايا كبرى  •  دعم فني مباشر على مدار 24 ساعة':fontcolor=#FEF08A:fontsize=24:x=(w-text_w)/2:y=450,"
    "drawbox=x=380:y=560:w=520:h=50:color=#CCFF00:t=fill,"
    f"drawtext=fontfile={FONT_TITLE}:text='ابدأ الآن عبر الموقع والتطبيق الرسمي':fontcolor=black:fontsize=24:x=(w-text_w)/2:y=574"
)
render_slide(7, 8, f7)

# Generate Audio Track (melodic electronic background)
audio_path = os.path.join(OUTPUT_DIR, "promo_audio.aac")
total_duration = 59
audio_cmd = [
    "ffmpeg", "-y",
    "-f", "lavfi", "-i", f"sine=f=220:d={total_duration}",
    "-f", "lavfi", "-i", f"sine=f=330:d={total_duration}",
    "-f", "lavfi", "-i", f"sine=f=440:d={total_duration}",
    "-filter_complex",
    f"[0:a][1:a][2:a]amix=inputs=3:dropout_transition=2,volume=0.25,afade=t=in:ss=0:d=2,afade=t=out:st={total_duration-3}:d=3[a]",
    "-map", "[a]",
    "-c:a", "aac",
    "-b:a", "128k",
    audio_path
]
subprocess.run(audio_cmd, check=True)
print("Audio generated successfully!")

# Concat video clips with concat demuxer
concat_txt = os.path.join(OUTPUT_DIR, "concat.txt")
with open(concat_txt, "w") as f:
    for i in range(1, 8):
        f.write(f"file '{OUTPUT_DIR}/scene_{i}.mp4'\n")

temp_video = os.path.join(OUTPUT_DIR, "video_only.mp4")
subprocess.run([
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", concat_txt,
    "-c", "copy",
    temp_video
], check=True)

# Merge video and audio into final MP4
subprocess.run([
    "ffmpeg", "-y",
    "-i", temp_video,
    "-i", audio_path,
    "-c:v", "copy",
    "-c:a", "aac",
    "-shortest",
    "-movflags", "+faststart",
    FINAL_VIDEO
], check=True)

# Also copy to fallback
shutil.copyfile(FINAL_VIDEO, FALLBACK_VIDEO)

print("Final MP4 generated successfully at:", FINAL_VIDEO)
size_mb = os.path.getsize(FINAL_VIDEO) / (1024 * 1024)
print(f"File size: {size_mb:.2f} MB")
