'use strict';

// https://layui.dev/docs/2/laydate/#demo-custom-cell
layui.use(function () {
  var laydate = layui.laydate;
  var $ = layui.$;
  // var util = layui.util;
  // 渲染
  laydate.render({
    elem: "#lunar-calendar-container > .layui-card-body > div",
    position: 'static',
    // value: '2024-03-30',
    isPreview: false,
    btns: ['now'],
    theme: 'lunar',
    autoConfirm: false,
    ready: function (date) {
      if (!this._previewEl) {
        var key = this.elem.attr('lay-key');
        var panelEl = $('#layui-laydate' + key);
        this._previewEl = panelEl.find('.layui-laydate-preview');
        this.cellRender(date);
      }
    },
    change: function(_, date) {
      this.cellRender(date);
    },
    onNow: function(_, date) {
      this.cellRender(date);
    },
    cellRender: function (ymd, render, info) {
      var that = this;
      var y = ymd.year;
      var m = ymd.month;
      var d = ymd.date;
      var lunarDate = Solar.fromYmd(y, m, d).getLunar();
      var lunar = lunarDate.getDayInChinese();
      var jieQi = lunarDate.getJieQi();
      var holiday = HolidayUtil.getHoliday(y, m, d);
      var displayHoliday = holiday && holiday.getTarget() === holiday.getDay() ? holiday.getName() : void 0;
      var displayHolidayBadge = holiday && holiday.getTarget() ? (holiday.isWork() ? '班' : '休') : void 0;
      var isHoliday = holiday && holiday.getTarget() && !holiday.isWork();
      // 在预览区显示自定义农历相关信息
      if (that._previewEl && (!info || (info && info.type === "date"))) {
        var holidayBadgeStyle = [
          'color:#fff',
          'background-color:' + (isHoliday ? '#eb3333' : '#333'),
          'display:' + (displayHolidayBadge ? 'inline-block' : 'none')
        ].join(';')
        var festivalBadgeStyle = [
          'color:#fff',
          'background-color:#1e9fff',
          'display:' + (displayHoliday || jieQi ? 'inline-block' : 'none')
        ].join(';')
        var tipsText = [
          '<div class="preview-inner">',
            '<div style="color:#333;">农历' + lunarDate.getMonthInChinese() + '月' + lunarDate.getDayInChinese() + '</div>',
            '<div style="font-size:10px">' + lunarDate.getYearInGanZhi() + lunarDate.getYearShengXiao() + '年</div>',
            '<div style="font-size:10px">' + lunarDate.getMonthInGanZhi() + '月 ' + lunarDate.getDayInGanZhi() + '日</div>',
            '<div class="badge" style="' + holidayBadgeStyle  +'">' + displayHolidayBadge + '</div>',
            '<div class="badge" style="'+ festivalBadgeStyle +'">' + (displayHoliday || jieQi) + '</div>',
          '</div>'
        ].join('');
        that._previewEl.html(tipsText);
      };
      if (!render) return;
      // 面板类型
      if (info.type === 'date') {
        var clazz = [
          'date-cell-inner',
          isHoliday ? 'holiday' : '',
          displayHoliday || jieQi ? 'hightlight' : '',
        ].join(' ');
        var content = [
          '<div class="' + clazz + '">',
            '<b>' + d + '</b>',
            '<i>' + (displayHoliday || jieQi || lunar) + '</i>',
            displayHolidayBadge ? '<u class="badge">' + displayHolidayBadge + '</u>' : '',
          '</div>',
        ].join('');
        // render(content)
        // render($(content)[0])
        var contentEl = $(content);
        contentEl.on('contextmenu', function (e) {
          e.preventDefault();
          layer.tips(lunarDate.toString(), this, {
            tips: [1, '#16baaa'],
            zIndex: 999999999,
          });
        });
        render(contentEl);
      } else if (info.type === 'year') {
        var lunarDate = Lunar.fromDate(new Date(y + 1, 0));
        var lunar = lunarDate.getYearInGanZhi() + lunarDate.getYearShengXiao();
        render([
          y + '年',
          '<div style="font-size:12px">' + lunar + '年</div>',
        ].join(''));
      } else if (info.type === 'month') {
        var lunar = lunarDate.getMonthInChinese();
        render([m + '月(' + lunar + '月)'].join(''));
      }
    },
  });
});

function showwhenenough() {
  try {
    var container = document.querySelector("div#lunar-calendar-container");
    if (360 > container.getBoundingClientRect().width) {
        container.querySelector(".layui-card-body > div").classList.add("layui-hide");
        container.querySelector(".layui-card-body > p").style.display = "inline";
        container.querySelector(".layui-card-header").innerText = "Fortune";
    } else {
        container.querySelector(".layui-card-body > div").classList.remove("layui-hide");
        container.querySelector(".layui-card-body > p").style.display = "block";
        container.querySelector(".layui-card-header").innerText = "农历";
    }
  } catch (e) {
    Sess.openErrLayer(e);
  }
}
window.addEventListener("resize", showwhenenough);
layui.use(showwhenenough);
