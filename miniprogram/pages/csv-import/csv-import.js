const { callFunction } = require('../../utils/cloud')

Page({
  data: {
    records: [],
    errors: [],
    warnings: [],
    parsed: false,
    importing: false,
    importResult: null,
    progress: 0
  },

  onDownloadTemplate() {
    // CSV 模板内容
    const template = '日期,机构,老师,课型,级别,时长(分钟),笔记,身体评分(1-5),老师评分(1-5),标签(用|分隔),愉悦度\n2026-01-15,XX芭蕾工作室,张老师,基训,中级,60,今天状态不错,4,5,跳跃|Adagio,😊'

    const fs = wx.getFileSystemManager()
    const filePath = `${wx.env.USER_DATA_PATH}/课时导入模板.csv`
    fs.writeFileSync(filePath, template, 'utf8')

    wx.shareFileMessage({
      filePath,
      success() {},
      fail() {
        wx.showToast({ title: '请通过电脑端获取模板', icon: 'none' })
      }
    })
  },

  onChooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['csv'],
      success: (res) => {
        const filePath = res.tempFiles[0].path
        this.parseCSV(filePath)
      }
    })
  },

  parseCSV(filePath) {
    const fs = wx.getFileSystemManager()
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n').filter(l => l.trim())

      if (lines.length < 2) {
        wx.showToast({ title: 'CSV 文件为空', icon: 'none' })
        return
      }

      // 跳过表头
      const records = []
      const errors = []
      const warnings = []

      for (let i = 1; i < lines.length; i++) {
        const cols = this.parseCSVLine(lines[i])
        if (cols.length < 5) {
          errors.push({ row: i, message: '列数不足' })
          continue
        }

        const record = {
          row: i,
          date: (cols[0] || '').trim(),
          studio: (cols[1] || '').trim(),
          teacher: (cols[2] || '').trim(),
          courseType: (cols[3] || '').trim(),
          level: (cols[4] || '').trim(),
          durationMin: (cols[5] || '60').trim(),
          notes: (cols[6] || '').trim(),
          bodyRating: (cols[7] || '').trim(),
          teacherRating: (cols[8] || '').trim(),
          tags: (cols[9] || '').trim(),
          moodEmoji: (cols[10] || '').trim(),
          status: 'ok'
        }

        // 校验必填
        if (!record.date || !record.studio || !record.teacher || !record.courseType || !record.durationMin) {
          record.status = 'error'
          errors.push({ row: i, message: '缺少必填字段' })
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
          record.status = 'error'
          errors.push({ row: i, message: '日期格式错误' })
        }

        records.push(record)
      }

      if (records.length > 1000) {
        wx.showModal({
          title: '超出上限',
          content: `共 ${records.length} 条，单次最多导入 1000 条，请拆分文件。`,
          showCancel: false
        })
        return
      }

      this.setData({ records, errors, warnings, parsed: true })
    } catch (err) {
      wx.showToast({ title: '文件读取失败', icon: 'none' })
    }
  },

  parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current)
    return result
  },

  async onConfirmImport() {
    const validRecords = this.data.records.filter(r => r.status !== 'error')

    if (validRecords.length === 0) {
      wx.showToast({ title: '没有可导入的记录', icon: 'none' })
      return
    }

    this.setData({ importing: true, progress: 0 })

    // 分批发送，每批 50 条
    const batchSize = 50
    let totalImported = 0
    const allErrors = []

    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize)

      try {
        const res = await callFunction('data', {
          action: 'importLessons',
          records: batch
        }, { showError: false })

        totalImported += res.imported
        if (res.errors) allErrors.push(...res.errors)
      } catch (err) {
        allErrors.push({ row: 0, message: `批次 ${Math.floor(i / batchSize) + 1} 写入失败` })
      }

      this.setData({ progress: Math.round(((i + batch.length) / validRecords.length) * 100) })
    }

    this.setData({
      importing: false,
      importResult: { imported: totalImported, total: validRecords.length, errors: allErrors }
    })

    if (totalImported > 0) {
      wx.showModal({
        title: '导入完成',
        content: `成功导入 ${totalImported} 条记录${allErrors.length > 0 ? '，' + allErrors.length + ' 条失败' : ''}`,
        showCancel: false,
        success() {
          wx.switchTab({ url: '/pages/lessons/lessons' })
        }
      })
    }
  }
})
