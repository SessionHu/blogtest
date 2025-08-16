# 在受版权限制的地区播放诈骗神曲
## 免责声明
> <strong>本文仅作学习讨论与技术研究, 严禁用于非法用途! 请尊重版权!</strong>
## 引言
* 如果你有关注过泽生的 B 站账号的 IP 属地, 你会发现一般都是在大陆之外的地区
* 很不幸的是, 由于版权原因, 诈骗神曲 [Never Gonna Give You Up](https://www.bilibili.com/video/BV1GJ411x7h7) 是不能在中国大陆以外的地区直接播放的<s>, 所以泽生基本没被骗过</s>
* 本文将向您给出一套完整的方法, 帮助您在受版权限制的地区成功取流播放这些视频!
## 环境
> 因为中国香港 🇨🇳🇭🇰 的输出不适合放在这里, 故在新加坡 🇸🇬 进行测试
```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "addr": "205.198.72.146",
    "country": "新加坡",
    "isp": "cogentco.com",
    "latitude": 1.352083,
    "longitude": 103.819836,
    "zone_id": 50331648,
    "country_code": 65
  }
}
```
## 过程
* 先通过搜索获取 UP 主 mid (UID), 由于 rickroll 的 UP 是 索尼音乐中国, 所以我们直接搜索, 得到 mid (UID) 为 `486906719`
  ![搜索索尼音乐](https://i0.hdslb.com/bfs/archive/80e0fb35ad42c7fbc67b40447ebb03b6d960929b.jpg)
* 通过关键词查询视频, 音乐的演唱者为 Rick Astley, 但不知道为什么输入空格会导致无返回, 所以我们直接搜索 `Astley`, 能查询到 `BV1GJ411x7h7`
  ```shell
  curl -G 'https://api.bilibili.com/x/series/recArchivesByKeywords' \
    --url-query 'mid=486906719' \
    --url-query 'keywords=Astley' \
    --url-query 'ps=50' \
    -s | jq .
  ```
  ```jsonc
  {
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
      "archives": [
        // 此处省略部分内容
        {
          "aid": 80433022,
          "title": "【官方 MV】Never Gonna Give You Up - Rick Astley",
          "pubdate": 1577835803,
          "ctime": 1577835803,
          "state": 0,
          "pic": "http://i1.hdslb.com/bfs/archive/5242750857121e05146d5d5b13a47a2a6dd36e98.jpg",
          "duration": 213,
          "stat": {
            "view": 92482804
          },
          "bvid": "BV1GJ411x7h7",
          "ugc_pay": 0,
          "interactive_video": false,
          "enable_vt": 0,
          "vt_display": "",
          "playback_position": 0
        }
        // 剩余内容也省略
      ]
    }
  }
  ```
* 接着需要获取到视频 `cid`, 因为后续取流我们将要用到视频的 `aid` 或 `bvid` (用于确定视频) 和 `cid` (用于确定分 P). 但 获取视频详细信息 是不行的, 由于版权原因在非大陆地区会返回 `-404`
* 不要着急, 又不是只有一种方法获取 `cid`, 通过 播放器分页列表 可以获取到视频所有 P 的 `cid`, 在这里 `BV1GJ411x7h7` 唯一 1P 的 `cid` 为 `137649199`
  ```shell
  curl 'https://api.bilibili.com/x/player/pagelist?bvid=BV1GJ411x7h7' | jq .
  ```
  ```json
  {
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": [
      {
        "cid": 137649199,
        "page": 1,
        "from": "vupload",
        "part": "Never Gonna Give You Up - Rick Astley",
        "duration": 213,
        "vid": "",
        "weblink": "",
        "dimension": {
          "width": 1920,
          "height": 1080,
          "rotate": 0
        },
        "ctime": 1577835803
      }
    ]
  }
  ```
* 通过 `bvid` 和 `cid` 成功获取音视频流 URL
  ```shell
  curl -G 'https://api.bilibili.com/x/player/playurl' \
    --data-urlencode 'bvid=BV1GJ411x7h7' \
    --data-urlencode 'cid=137649199' \
    --data-urlencode 'qn=112' \
    --data-urlencode 'fnval=16' \
    --data-urlencode 'fnver=0' \
    --data-urlencode 'fourk=1' \
    -s | jq .
  ```
  <details>
  <summary>查看 JSON 回复:</summary>

  ```json
  {
    "code": 0,
    "message": "0",
    "ttl": 1,
    "data": {
      "from": "local",
      "result": "suee",
      "message": "",
      "quality": 64,
      "format": "flv720",
      "timelength": 212393,
      "accept_format": "hdflv2,flv,flv720,flv480,mp4",
      "accept_description": [
        "高清 1080P+",
        "高清 1080P",
        "高清 720P",
        "清晰 480P",
        "流畅 360P"
      ],
      "accept_quality": [
        112,
        80,
        64,
        32,
        16
      ],
      "video_codecid": 7,
      "seek_param": "start",
      "seek_type": "offset",
      "dash": {
        "duration": 213,
        "minBufferTime": 1.5,
        "min_buffer_time": 1.5,
        "video": [
          {
            "id": 32,
            "baseUrl": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2x1-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&mid=0&nbs=1&og=cos&uipk=5&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&deadline=1749280595&oi=3452323986&tag=&gen=playurlv3&os=akam&upsig=b9c8612c85f3b24be2ee9f8e6dadebef&uparams=e,mid,nbs,og,uipk,platform,trid,deadline,oi,tag,gen,os&hdnts=exp=1749280595~hmac=91f545128fc535a412c67a02e87ea192ed5d1b4a545735ca634fadac138d0b84&bvc=vod&nettype=0&bw=218859&buvid=&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,2",
            "base_url": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2x1-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&mid=0&nbs=1&og=cos&uipk=5&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&deadline=1749280595&oi=3452323986&tag=&gen=playurlv3&os=akam&upsig=b9c8612c85f3b24be2ee9f8e6dadebef&uparams=e,mid,nbs,og,uipk,platform,trid,deadline,oi,tag,gen,os&hdnts=exp=1749280595~hmac=91f545128fc535a412c67a02e87ea192ed5d1b4a545735ca634fadac138d0b84&bvc=vod&nettype=0&bw=218859&buvid=&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,2",
            "backupUrl": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2x1-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&trid=b826f8867e364e99b5663c48a7f902du&tag=&uipk=5&os=aliovbv&og=cos&mid=0&deadline=1749280595&oi=3452323986&nbs=1&platform=pc&gen=playurlv3&upsig=4905d7982707f1d6f1e11e233e784bb8&uparams=e,trid,tag,uipk,os,og,mid,deadline,oi,nbs,platform,gen&bvc=vod&nettype=0&bw=218859&f=u_0_0&agrr=0&buvid=&build=0&dl=0&orderid=1,2"
            ],
            "backup_url": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2x1-1-100110.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&trid=b826f8867e364e99b5663c48a7f902du&tag=&uipk=5&os=aliovbv&og=cos&mid=0&deadline=1749280595&oi=3452323986&nbs=1&platform=pc&gen=playurlv3&upsig=4905d7982707f1d6f1e11e233e784bb8&uparams=e,trid,tag,uipk,os,og,mid,deadline,oi,nbs,platform,gen&bvc=vod&nettype=0&bw=218859&f=u_0_0&agrr=0&buvid=&build=0&dl=0&orderid=1,2"
            ],
            "bandwidth": 218550,
            "mimeType": "video/mp4",
            "mime_type": "video/mp4",
            "codecs": "hev1.1.6.L120.90",
            "width": 852,
            "height": 480,
            "frameRate": "25",
            "frame_rate": "25",
            "sar": "640:639",
            "startWithSap": 1,
            "start_with_sap": 1,
            "SegmentBase": {
              "Initialization": "0-1085",
              "indexRange": "1086-1633"
            },
            "segment_base": {
              "initialization": "0-1085",
              "index_range": "1086-1633"
            },
            "codecid": 12
          },
          {
            "id": 32,
            "baseUrl": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&oi=3452323986&nbs=1&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&deadline=1749280595&gen=playurlv3&os=akam&tag=&uipk=5&mid=0&og=hw&upsig=824c8a38553dd214f3467bacba6f3827&uparams=e,oi,nbs,platform,trid,deadline,gen,os,tag,uipk,mid,og&hdnts=exp=1749280595~hmac=50faf48c7e479ec28a4a1fa66ca4e7d735dfdbbea66b9d7d105ddbf831eeaf15&bvc=vod&nettype=0&bw=787656&build=0&dl=0&f=u_0_0&agrr=0&buvid=&orderid=0,2",
            "base_url": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&oi=3452323986&nbs=1&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&deadline=1749280595&gen=playurlv3&os=akam&tag=&uipk=5&mid=0&og=hw&upsig=824c8a38553dd214f3467bacba6f3827&uparams=e,oi,nbs,platform,trid,deadline,gen,os,tag,uipk,mid,og&hdnts=exp=1749280595~hmac=50faf48c7e479ec28a4a1fa66ca4e7d735dfdbbea66b9d7d105ddbf831eeaf15&bvc=vod&nettype=0&bw=787656&build=0&dl=0&f=u_0_0&agrr=0&buvid=&orderid=0,2",
            "backupUrl": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&og=hw&nbs=1&uipk=5&deadline=1749280595&oi=3452323986&gen=playurlv3&tag=&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&mid=0&os=aliovbv&upsig=39d8be73a5a1949112192e6d5baf0cb5&uparams=e,og,nbs,uipk,deadline,oi,gen,tag,platform,trid,mid,os&bvc=vod&nettype=0&bw=787656&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "backup_url": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30032.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&og=hw&nbs=1&uipk=5&deadline=1749280595&oi=3452323986&gen=playurlv3&tag=&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&mid=0&os=aliovbv&upsig=39d8be73a5a1949112192e6d5baf0cb5&uparams=e,og,nbs,uipk,deadline,oi,gen,tag,platform,trid,mid,os&bvc=vod&nettype=0&bw=787656&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "bandwidth": 786766,
            "mimeType": "video/mp4",
            "mime_type": "video/mp4",
            "codecs": "avc1.64001F",
            "width": 852,
            "height": 480,
            "frameRate": "25",
            "frame_rate": "25",
            "sar": "640:639",
            "startWithSap": 1,
            "start_with_sap": 1,
            "SegmentBase": {
              "Initialization": "0-1011",
              "indexRange": "1012-1547"
            },
            "segment_base": {
              "initialization": "0-1011",
              "index_range": "1012-1547"
            },
            "codecid": 7
          },
          {
            "id": 16,
            "baseUrl": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2x1-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&nbs=1&os=akam&og=cos&uipk=5&mid=0&deadline=1749280595&oi=3452323986&tag=&gen=playurlv3&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&upsig=3016cbb1b779a480782bbbb21b7b750a&uparams=e,nbs,os,og,uipk,mid,deadline,oi,tag,gen,platform,trid&hdnts=exp=1749280595~hmac=852a0dc8ce24f9376bc1f4f53382c5ead9b97f29e31304bdf60ec528696c0ef8&bvc=vod&nettype=0&bw=153455&buvid=&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,2",
            "base_url": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2x1-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&nbs=1&os=akam&og=cos&uipk=5&mid=0&deadline=1749280595&oi=3452323986&tag=&gen=playurlv3&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&upsig=3016cbb1b779a480782bbbb21b7b750a&uparams=e,nbs,os,og,uipk,mid,deadline,oi,tag,gen,platform,trid&hdnts=exp=1749280595~hmac=852a0dc8ce24f9376bc1f4f53382c5ead9b97f29e31304bdf60ec528696c0ef8&bvc=vod&nettype=0&bw=153455&buvid=&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,2",
            "backupUrl": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2x1-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&os=aliovbv&deadline=1749280595&oi=3452323986&tag=&uipk=5&platform=pc&gen=playurlv3&nbs=1&trid=b826f8867e364e99b5663c48a7f902du&mid=0&og=cos&upsig=43d53023aa54550b155b40cc1d9713c1&uparams=e,os,deadline,oi,tag,uipk,platform,gen,nbs,trid,mid,og&bvc=vod&nettype=0&bw=153455&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "backup_url": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2x1-1-100109.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&os=aliovbv&deadline=1749280595&oi=3452323986&tag=&uipk=5&platform=pc&gen=playurlv3&nbs=1&trid=b826f8867e364e99b5663c48a7f902du&mid=0&og=cos&upsig=43d53023aa54550b155b40cc1d9713c1&uparams=e,os,deadline,oi,tag,uipk,platform,gen,nbs,trid,mid,og&bvc=vod&nettype=0&bw=153455&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "bandwidth": 153220,
            "mimeType": "video/mp4",
            "mime_type": "video/mp4",
            "codecs": "hev1.1.6.L120.90",
            "width": 640,
            "height": 360,
            "frameRate": "25",
            "frame_rate": "25",
            "sar": "1:1",
            "startWithSap": 1,
            "start_with_sap": 1,
            "SegmentBase": {
              "Initialization": "0-1081",
              "indexRange": "1082-1629"
            },
            "segment_base": {
              "initialization": "0-1081",
              "index_range": "1082-1629"
            },
            "codecid": 12
          },
          {
            "id": 16,
            "baseUrl": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&oi=3452323986&tag=&os=akam&nbs=1&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&mid=0&deadline=1749280595&uipk=5&gen=playurlv3&og=cos&upsig=9b4cef2015a907cfb713059a8c6c594b&uparams=e,oi,tag,os,nbs,platform,trid,mid,deadline,uipk,gen,og&hdnts=exp=1749280595~hmac=9ed7ce77ce8d2a90473731ff30369281bac9cca8a3944cb7d894bb29b8f91297&bvc=vod&nettype=0&bw=350649&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=0,2",
            "base_url": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&oi=3452323986&tag=&os=akam&nbs=1&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&mid=0&deadline=1749280595&uipk=5&gen=playurlv3&og=cos&upsig=9b4cef2015a907cfb713059a8c6c594b&uparams=e,oi,tag,os,nbs,platform,trid,mid,deadline,uipk,gen,og&hdnts=exp=1749280595~hmac=9ed7ce77ce8d2a90473731ff30369281bac9cca8a3944cb7d894bb29b8f91297&bvc=vod&nettype=0&bw=350649&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=0,2",
            "backupUrl": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&tag=&platform=pc&os=aliovbv&og=cos&trid=b826f8867e364e99b5663c48a7f902du&mid=0&deadline=1749280595&gen=playurlv3&oi=3452323986&nbs=1&uipk=5&upsig=d09030650f3ad7d8d1a31e0eb3b6d592&uparams=e,tag,platform,os,og,trid,mid,deadline,gen,oi,nbs,uipk&bvc=vod&nettype=0&bw=350649&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "backup_url": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30016.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&tag=&platform=pc&os=aliovbv&og=cos&trid=b826f8867e364e99b5663c48a7f902du&mid=0&deadline=1749280595&gen=playurlv3&oi=3452323986&nbs=1&uipk=5&upsig=d09030650f3ad7d8d1a31e0eb3b6d592&uparams=e,tag,platform,os,og,trid,mid,deadline,gen,oi,nbs,uipk&bvc=vod&nettype=0&bw=350649&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "bandwidth": 350253,
            "mimeType": "video/mp4",
            "mime_type": "video/mp4",
            "codecs": "avc1.64001E",
            "width": 640,
            "height": 360,
            "frameRate": "25",
            "frame_rate": "25",
            "sar": "1:1",
            "startWithSap": 1,
            "start_with_sap": 1,
            "SegmentBase": {
              "Initialization": "0-1015",
              "indexRange": "1016-1551"
            },
            "segment_base": {
              "initialization": "0-1015",
              "index_range": "1016-1551"
            },
            "codecid": 7
          }
        ],
        "audio": [
          {
            "id": 30232,
            "baseUrl": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&trid=b826f8867e364e99b5663c48a7f902du&mid=0&deadline=1749280595&tag=&nbs=1&uipk=5&platform=pc&gen=playurlv3&os=akam&og=cos&oi=3452323986&upsig=641a5af3fc2455df451c766f10e359f8&uparams=e,trid,mid,deadline,tag,nbs,uipk,platform,gen,os,og,oi&hdnts=exp=1749280595~hmac=815a08c4d30cd90934d523ea18c591c77253e2318f8e1092bd809c0a37a4f953&bvc=vod&nettype=0&bw=103081&dl=0&f=u_0_0&agrr=0&buvid=&build=0&orderid=0,2",
            "base_url": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&trid=b826f8867e364e99b5663c48a7f902du&mid=0&deadline=1749280595&tag=&nbs=1&uipk=5&platform=pc&gen=playurlv3&os=akam&og=cos&oi=3452323986&upsig=641a5af3fc2455df451c766f10e359f8&uparams=e,trid,mid,deadline,tag,nbs,uipk,platform,gen,os,og,oi&hdnts=exp=1749280595~hmac=815a08c4d30cd90934d523ea18c591c77253e2318f8e1092bd809c0a37a4f953&bvc=vod&nettype=0&bw=103081&dl=0&f=u_0_0&agrr=0&buvid=&build=0&orderid=0,2",
            "backupUrl": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&deadline=1749280595&oi=3452323986&tag=&uipk=5&trid=b826f8867e364e99b5663c48a7f902du&gen=playurlv3&os=aliovbv&mid=0&nbs=1&platform=pc&og=cos&upsig=ccef4587b689fcafbfe4828f5b6d9636&uparams=e,deadline,oi,tag,uipk,trid,gen,os,mid,nbs,platform,og&bvc=vod&nettype=0&bw=103081&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "backup_url": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&deadline=1749280595&oi=3452323986&tag=&uipk=5&trid=b826f8867e364e99b5663c48a7f902du&gen=playurlv3&os=aliovbv&mid=0&nbs=1&platform=pc&og=cos&upsig=ccef4587b689fcafbfe4828f5b6d9636&uparams=e,deadline,oi,tag,uipk,trid,gen,os,mid,nbs,platform,og&bvc=vod&nettype=0&bw=103081&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "bandwidth": 102931,
            "mimeType": "audio/mp4",
            "mime_type": "audio/mp4",
            "codecs": "mp4a.40.2",
            "width": 0,
            "height": 0,
            "frameRate": "",
            "frame_rate": "",
            "sar": "",
            "startWithSap": 0,
            "start_with_sap": 0,
            "SegmentBase": {
              "Initialization": "0-933",
              "indexRange": "934-1481"
            },
            "segment_base": {
              "initialization": "0-933",
              "index_range": "934-1481"
            },
            "codecid": 0
          },
          {
            "id": 30280,
            "baseUrl": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&tag=&uipk=5&gen=playurlv3&os=akam&og=hw&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&deadline=1749280595&mid=0&oi=3452323986&nbs=1&upsig=b3887866f1fae1d57d02401ce9429c05&uparams=e,tag,uipk,gen,os,og,platform,trid,deadline,mid,oi,nbs&hdnts=exp=1749280595~hmac=da20751196014595005030845f2f2c8fb0ff92461694de5c65bc29176765faa4&bvc=vod&nettype=0&bw=204082&buvid=&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,2",
            "base_url": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&tag=&uipk=5&gen=playurlv3&os=akam&og=hw&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&deadline=1749280595&mid=0&oi=3452323986&nbs=1&upsig=b3887866f1fae1d57d02401ce9429c05&uparams=e,tag,uipk,gen,os,og,platform,trid,deadline,mid,oi,nbs&hdnts=exp=1749280595~hmac=da20751196014595005030845f2f2c8fb0ff92461694de5c65bc29176765faa4&bvc=vod&nettype=0&bw=204082&buvid=&build=0&dl=0&f=u_0_0&agrr=0&orderid=0,2",
            "backupUrl": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&trid=b826f8867e364e99b5663c48a7f902du&og=hw&deadline=1749280595&tag=&nbs=1&uipk=5&os=aliovbv&mid=0&oi=3452323986&platform=pc&gen=playurlv3&upsig=f0aed4af4ca1ea951a69342585d6f23b&uparams=e,trid,og,deadline,tag,nbs,uipk,os,mid,oi,platform,gen&bvc=vod&nettype=0&bw=204082&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "backup_url": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30280.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&trid=b826f8867e364e99b5663c48a7f902du&og=hw&deadline=1749280595&tag=&nbs=1&uipk=5&os=aliovbv&mid=0&oi=3452323986&platform=pc&gen=playurlv3&upsig=f0aed4af4ca1ea951a69342585d6f23b&uparams=e,trid,og,deadline,tag,nbs,uipk,os,mid,oi,platform,gen&bvc=vod&nettype=0&bw=204082&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "bandwidth": 203786,
            "mimeType": "audio/mp4",
            "mime_type": "audio/mp4",
            "codecs": "mp4a.40.2",
            "width": 0,
            "height": 0,
            "frameRate": "",
            "frame_rate": "",
            "sar": "",
            "startWithSap": 0,
            "start_with_sap": 0,
            "SegmentBase": {
              "Initialization": "0-933",
              "indexRange": "934-1481"
            },
            "segment_base": {
              "initialization": "0-933",
              "index_range": "934-1481"
            },
            "codecid": 0
          },
          {
            "id": 30216,
            "baseUrl": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&gen=playurlv3&os=akam&deadline=1749280595&oi=3452323986&nbs=1&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&tag=&uipk=5&mid=0&og=hw&upsig=3e5a252e23e654f0da1c9b4fd803b622&uparams=e,gen,os,deadline,oi,nbs,platform,trid,tag,uipk,mid,og&hdnts=exp=1749280595~hmac=23c2441229b698ae4df36236765fec7dc8a8d0319f1d07637315dacb59b760c9&bvc=vod&nettype=0&bw=44043&build=0&dl=0&f=u_0_0&agrr=0&buvid=&orderid=0,2",
            "base_url": "https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&gen=playurlv3&os=akam&deadline=1749280595&oi=3452323986&nbs=1&platform=pc&trid=b826f8867e364e99b5663c48a7f902du&tag=&uipk=5&mid=0&og=hw&upsig=3e5a252e23e654f0da1c9b4fd803b622&uparams=e,gen,os,deadline,oi,nbs,platform,trid,tag,uipk,mid,og&hdnts=exp=1749280595~hmac=23c2441229b698ae4df36236765fec7dc8a8d0319f1d07637315dacb59b760c9&bvc=vod&nettype=0&bw=44043&build=0&dl=0&f=u_0_0&agrr=0&buvid=&orderid=0,2",
            "backupUrl": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&gen=playurlv3&platform=pc&oi=3452323986&deadline=1749280595&tag=&nbs=1&uipk=5&os=aliovbv&og=hw&trid=b826f8867e364e99b5663c48a7f902du&mid=0&upsig=0ee3094358c95443e739dfd240561580&uparams=e,gen,platform,oi,deadline,tag,nbs,uipk,os,og,trid,mid&bvc=vod&nettype=0&bw=44043&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "backup_url": [
              "https://upos-sz-mirroraliov.bilivideo.com/upgcxcode/99/91/137649199/137649199_da2-1-30216.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&gen=playurlv3&platform=pc&oi=3452323986&deadline=1749280595&tag=&nbs=1&uipk=5&os=aliovbv&og=hw&trid=b826f8867e364e99b5663c48a7f902du&mid=0&upsig=0ee3094358c95443e739dfd240561580&uparams=e,gen,platform,oi,deadline,tag,nbs,uipk,os,og,trid,mid&bvc=vod&nettype=0&bw=44043&agrr=0&buvid=&build=0&dl=0&f=u_0_0&orderid=1,2"
            ],
            "bandwidth": 43962,
            "mimeType": "audio/mp4",
            "mime_type": "audio/mp4",
            "codecs": "mp4a.40.5",
            "width": 0,
            "height": 0,
            "frameRate": "",
            "frame_rate": "",
            "sar": "",
            "startWithSap": 0,
            "start_with_sap": 0,
            "SegmentBase": {
              "Initialization": "0-943",
              "indexRange": "944-1491"
            },
            "segment_base": {
              "initialization": "0-943",
              "index_range": "944-1491"
            },
            "codecid": 0
          }
        ],
        "dolby": {
          "type": 0,
          "audio": null
        },
        "flac": null
      },
      "support_formats": [
        {
          "quality": 112,
          "format": "hdflv2",
          "new_description": "1080P 高码率",
          "display_desc": "1080P",
          "superscript": "高码率",
          "codecs": [
            "avc1.640032",
            "hev1.1.6.L150.90"
          ]
        },
        {
          "quality": 80,
          "format": "flv",
          "new_description": "1080P 高清",
          "display_desc": "1080P",
          "superscript": "",
          "codecs": [
            "avc1.640032",
            "hev1.1.6.L150.90"
          ]
        },
        {
          "quality": 64,
          "format": "flv720",
          "new_description": "720P 准高清",
          "display_desc": "720P",
          "superscript": "",
          "codecs": [
            "avc1.640028",
            "hev1.1.6.L120.90"
          ]
        },
        {
          "quality": 32,
          "format": "flv480",
          "new_description": "480P 标清",
          "display_desc": "480P",
          "superscript": "",
          "codecs": [
            "avc1.64001F",
            "hev1.1.6.L120.90"
          ]
        },
        {
          "quality": 16,
          "format": "mp4",
          "new_description": "360P 流畅",
          "display_desc": "360P",
          "superscript": "",
          "codecs": [
            "avc1.64001E",
            "hev1.1.6.L120.90"
          ]
        }
      ],
      "high_format": null,
      "last_play_time": 0,
      "last_play_cid": 0,
      "view_info": null,
      "play_conf": {
        "is_new_description": false
      }
    }
  }
  ```

  </details>
* 最后使用 VLC 进行播放, 你没被骗!
  ```shell
  vlc 'https://upos-hz-mirrorakam.akamaized.net/upgcxcode/99/91/137649199/137649199_da2-1-30232.m4s?e=ig8euxZM2rNcNbdlhoNvNC8BqJIzNbfqXBvEqxTEto8BTrNvN0GvT90W5JZMkX_YN0MvXg8gNEV4NC8xNEV4N03eN0B5tZlqNxTEto8BTrNvNeZVuJ10Kj_g2UB02J0mN0B5tZlqNCNEto8BTrNvNC7MTX502C8f2jmMQJ6mqF2fka1mqx6gqj0eN0B599M=&trid=b826f8867e364e99b5663c48a7f902du&mid=0&deadline=1749280595&tag=&nbs=1&uipk=5&platform=pc&gen=playurlv3&os=akam&og=cos&oi=3452323986&upsig=641a5af3fc2455df451c766f10e359f8&uparams=e,trid,mid,deadline,tag,nbs,uipk,platform,gen,os,og,oi&hdnts=exp=1749280595~hmac=815a08c4d30cd90934d523ea18c591c77253e2318f8e1092bd809c0a37a4f953&bvc=vod&nettype=0&bw=103081&dl=0&f=u_0_0&agrr=0&buvid=&build=0&orderid=0,2'    
  ```
  ![VLC 播放 HTTPS 音频内容](https://i1.hdslb.com/bfs/archive/069a271e957dd49e6974b74f9742ef686d3f4a42.jpg)
## 后记
* 除了 Never Gonna Give You Up, 还有很多类似的因版权原因无法在非大陆地区直接播放的视频, UP 主 索尼音乐中国 的 22 万个视频很多都是这样
* 对于版权, 我与很多人一样是又爱又恨, 一方面保护了创作者的权益, 另一方面也阻止了内容更广泛分享与传播, 这就是为什么会出现 CC (知识共享)
* 但愿我给出的方法能帮助到一些并不常住在大陆的 B 站用户们
