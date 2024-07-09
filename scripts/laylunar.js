{

    // https://layui.dev/docs/2/laydate/#demo-custom-cell
    const laylunar = () => layui.laydate.render({
        elem: '#lunar-calendar-container > .layui-card-body > div',
        position: 'static',
        // value: '2024-03-30',
        isPreview: false,
        btns: ['now'],
        theme: 'lunar',
        autoConfirm: false,
        ready: function (date) {
            if (!this._previewEl) {
                const key = this.elem.attr('lay-key');
                const panelEl = layui.$('#layui-laydate' + key);
                this._previewEl = panelEl.find('.layui-laydate-preview');
                this.cellRender(date);
            }
        },
        change: function (value, date) {
            this.cellRender(date);
        },
        onNow: function (value, date) {
            this.cellRender(date);
        },
        cellRender: function (ymd, render, info) {
            const y = ymd.year;
            const m = ymd.month;
            const d = ymd.date;
            const lunarDate = Solar.fromYmd(y, m, d).getLunar();
            const lunar = lunarDate.getDayInChinese();
            const jieQi = lunarDate.getJieQi();
            const holiday = HolidayUtil.getHoliday(y, m, d);
            const displayHoliday = holiday && holiday.getTarget() === holiday.getDay() ? holiday.getName() : undefined;
            const displayHolidayBadge = holiday && holiday.getTarget() ? (holiday.isWork() ? '班' : '休') : undefined;
            const isHoliday = holiday && holiday.getTarget() && !holiday.isWork();
            // 在预览区显示自定义农历相关信息
            if (this._previewEl && (!info || (info && info.type === "date"))) {
                const holidayBadgeStyle = [
                    'color:#fff',
                    'background-color:' + (isHoliday ? '#eb3333' : '#333'),
                    'display:' + (displayHolidayBadge ? 'inline-block' : 'none')
                ].join(';')
                const festivalBadgeStyle = [
                    'color:#fff',
                    'background-color:#1e9fff',
                    'display:' + (displayHoliday || jieQi ? 'inline-block' : 'none')
                ].join(';')
                const tipsText = [
                    '<div class="preview-inner">',
                    '<div style="/*color:#333;*/">农历' + lunarDate.getMonthInChinese() + '月' + lunarDate.getDayInChinese() + '</div>',
                    '<div style="font-size:10px">' + lunarDate.getYearInGanZhi() + lunarDate.getYearShengXiao() + '年</div>',
                    '<div style="font-size:10px">' + lunarDate.getMonthInGanZhi() + '月 ' + lunarDate.getDayInGanZhi() + '日</div>',
                    '<div class="badge" style="' + holidayBadgeStyle + '">' + displayHolidayBadge + '</div>',
                    '<div class="badge" style="' + festivalBadgeStyle + '">' + (displayHoliday || jieQi) + '</div>',
                    '</div>'
                ].join('');
                this._previewEl.html(tipsText);
            };
            if (!render) return;
            // 面板类型
            if (info.type === 'date') {
                const clazz = [
                    'date-cell-inner',
                    isHoliday ? 'holiday' : '',
                    displayHoliday || jieQi ? 'hightlight' : '',
                ].join(' ');
                const content = [
                    '<div class="' + clazz + '">',
                    '<b>' + d + '</b>',
                    '<i>' + (displayHoliday || jieQi || lunar) + '</i>',
                    displayHolidayBadge ? '<u class="badge">' + displayHolidayBadge + '</u>' : '',
                    '</div>',
                ].join('');
                // render(content)
                // render(layui.$(content)[0])
                const contentEl = layui.$(content);
                contentEl.on('contextmenu', function (e) {
                    e.preventDefault();
                    layer.tips(lunarDate.toString(), this, {
                        tips: [1, '#16baaa'],
                        zIndex: 999999999,
                    });
                });
                render(contentEl);
            } else if (info.type === 'year') {
                const lunarDate = Lunar.fromDate(new Date(y + 1, 0));
                const lunar = lunarDate.getYearInGanZhi() + lunarDate.getYearShengXiao();
                render([
                    y + '年',
                    '<div style="font-size:12px">' + lunar + '年</div>',
                ].join(''));
            } else if (info.type === 'month') {
                const lunar = lunarDate.getMonthInChinese();
                render([m + '月(' + lunar + '月)'].join(''));
            }
        },
    });

    const fun = () => {
        try {
            const container = document.querySelector("div#lunar-calendar-container");
            if (362 > container.getBoundingClientRect().width) {
                container.querySelector(".layui-card-body > div").classList.add("layui-hide");
                container.querySelector(".layui-card-body > p").style.display = "inline";
                container.querySelector(".layui-card-header").innerText = "Fortune";
            } else {
                container.querySelector(".layui-card-body > div").classList.remove("layui-hide");
                container.querySelector(".layui-card-body > p").style.display = "block";
                container.querySelector(".layui-card-header").innerText = "农历";
                if (container.querySelector("#lunar-calendar-container > .layui-card-body > div > div") === null) {
                    laylunar();
                }
            }
        } catch (e) {
            Sess.openErrLayer(e);
        }
    }
    window.addEventListener("resize", fun);
    layui.use(fun);

}