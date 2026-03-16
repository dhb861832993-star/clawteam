import { test, expect } from '@playwright/test'

/**
 * Agent Dashboard E2E Tests
 *
 * 测试覆盖：
 * 1. 聊天记忆切换 Bug 修复
 * 2. 工作流编辑器功能
 * 3. Agent 技能管理
 */

test.describe('Agent Dashboard Features', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用首页
    await page.goto('/')

    // 等待页面加载完成
    await page.waitForSelector('header', { timeout: 10000 })
  })

  // ========================================
  // 测试 1：聊天记忆切换 Bug 修复
  // ========================================
  test('聊天记忆切换 - Agent 切换后消息应正确保留', async ({ page, browserName }) => {
    // 跳过非 chromium 浏览器（渲染速度差异）
    test.skip(browserName !== 'chromium', 'Chat memory test only on chromium')

    // 设置较长的超时时间
    test.setTimeout(60000)

    // 等待 Agent 列表加载
    const agentPanel = page.locator('[data-testid="agent-panel"]')
    await expect(agentPanel).toBeVisible({ timeout: 20000 })

    // 步骤 1：选择"大熊" Agent
    const daXiongCard = page.locator('text=大熊').first()
    await daXiongCard.click()

    // 等待右侧面板加载
    await page.waitForTimeout(500)

    // 切换到对话模式
    const chatTab = page.locator('button:has-text("💬 对话")')
    await chatTab.click()

    // 步骤 2：发送 3 条消息给大熊
    const chatInput = page.locator('input[placeholder*="输入消息"]')

    for (let i = 1; i <= 3; i++) {
      // 等待输入框可见
      await chatInput.waitFor({ state: 'visible', timeout: 5000 })

      // 使用 type 逐字符输入，确保触发 React 事件
      await chatInput.click() // 先聚焦
      await chatInput.press('Control+A') // 全选
      await chatInput.press('Backspace') // 清空
      await chatInput.type(`大熊测试消息 ${i}`, { delay: 50 }) // 逐字输入

      // 按 Enter 发送
      await chatInput.press('Enter')

      // 等待用户消息出现在界面上
      const messageLocator = page.locator(`text=大熊测试消息 ${i}`)
      await expect(messageLocator).toBeVisible({ timeout: 5000 })

      // 等待输入框恢复（可能因 API 超时而保持 disabled）
      await page.waitForTimeout(1000)
    }

    // 验证大熊有 3 条用户消息
    const daXiongMessages = page.locator('text=大熊测试消息')
    await expect(daXiongMessages).toHaveCount(3, { timeout: 5000 })

    // 记录消息数量用于后续验证
    const daXiongMessageCount = await daXiongMessages.count()

    // 步骤 3：切换到"队长" Agent
    const duiZhangCard = page.locator('text=队长').first()
    await duiZhangCard.click()
    await page.waitForTimeout(500)

    // 步骤 4：发送 3 条消息给队长
    for (let i = 1; i <= 3; i++) {
      // 等待输入框可见
      await chatInput.waitFor({ state: 'visible', timeout: 5000 })

      // 使用 type 逐字符输入
      await chatInput.click()
      await chatInput.press('Control+A')
      await chatInput.press('Backspace')
      await chatInput.type(`队长测试消息 ${i}`, { delay: 50 })

      await chatInput.press('Enter')

      // 等待用户消息出现
      const messageLocator = page.locator(`text=队长测试消息 ${i}`)
      await expect(messageLocator).toBeVisible({ timeout: 5000 })

      await page.waitForTimeout(1000)
    }

    // 验证队长有 3 条用户消息
    const duiZhangMessages = page.locator('text=队长测试消息')
    await expect(duiZhangMessages).toHaveCount(3, { timeout: 5000 })

    const duiZhangMessageCount = await duiZhangMessages.count()

    // 步骤 5：切换回大熊，验证消息保留
    await daXiongCard.click()
    await page.waitForTimeout(500)

    // 验证大熊的消息仍然存在
    const daXiongMessagesAfterSwitch = page.locator('text=大熊测试消息')
    await expect(daXiongMessagesAfterSwitch).toHaveCount(daXiongMessageCount, { timeout: 5000 })

    // 步骤 6：再切换到队长，验证消息保留
    await duiZhangCard.click()
    await page.waitForTimeout(500)

    // 验证队长的消息仍然存在
    const duiZhangMessagesAfterSwitch = page.locator('text=队长测试消息')
    await expect(duiZhangMessagesAfterSwitch).toHaveCount(duiZhangMessageCount, { timeout: 5000 })
  })

  // ========================================
  // 测试 2：工作流编辑器
  // ========================================
  test('工作流编辑器 - 打开、验证预设工作流、关闭', async ({ page }) => {
    // 点击 Header 的 Workflow 按钮（使用 first() 避免 Quick Actions 的重复按钮）
    const workflowButton = page.locator('button:has-text("📊"):has-text("Workflow")').first()
    await workflowButton.click()

    // 验证弹窗打开
    const modal = page.locator('text=📊 工作流编辑器')
    await expect(modal).toBeVisible({ timeout: 5000 })

    // 验证弹窗描述
    const modalDescription = page.locator('text=拖拽式工作流设计工具')
    await expect(modalDescription).toBeVisible()

    // 验证预设工作流节点显示
    const expectedNodes = [
      '📊 市场调研',
      '✍️ 内容创作',
      '🎨 设计封面',
      '📱 发布小红书'
    ]

    for (const nodeText of expectedNodes) {
      const node = page.locator(`text=${nodeText}`)
      await expect(node).toBeVisible({ timeout: 3000 })
    }

    // 验证底部统计信息
    const footerInfo = page.locator('text=节点 ·')
    await expect(footerInfo).toBeVisible()

    // 验证工具栏按钮存在
    const addTaskButton = page.locator('button:has-text("添加任务")')
    await expect(addTaskButton).toBeVisible()

    // 关闭弹窗
    const closeButton = page.locator('button').filter({
      has: page.locator('svg path[d*="M6 18L18 6M6 6l12 12"]')
    }).first()
    await closeButton.click()

    // 验证弹窗已关闭
    await expect(modal).not.toBeVisible({ timeout: 3000 })
  })

  // ========================================
  // 测试 3：Agent 技能管理
  // ========================================
  test('Agent 技能管理 - 显示技能列表、安装/移除功能', async ({ page, browserName }) => {
    // 跳过非 chromium 浏览器
    test.skip(browserName !== 'chromium', 'Skills panel test only on chromium')

    // 等待 Agent 列表加载
    const agentPanel = page.locator('[data-testid="agent-panel"]')
    await expect(agentPanel).toBeVisible({ timeout: 20000 })

    // 步骤 1：选择任意 Agent（大熊）
    const daXiongCard = page.locator('text=大熊').first()
    await daXiongCard.click()
    await page.waitForTimeout(500)

    // 步骤 2：确保在属性面板
    const propertiesTab = page.locator('button:has-text("⚙️ 属性")')
    await propertiesTab.click()

    // 步骤 3：点击技能管理标签
    const skillsTab = page.locator('button:has-text("🧩 技能管理")')
    await skillsTab.click()

    // 验证技能管理面板显示
    const skillsHeader = page.locator('text=的技能')
    await expect(skillsHeader).toBeVisible({ timeout: 5000 })

    // 验证已安装计数显示
    const installedCount = page.locator('text=已安装:')
    await expect(installedCount).toBeVisible()

    // 步骤 4：验证技能列表显示（使用精确匹配避免 description 干扰）
    const expectedSkills = [
      'coding-agent',
      'weather',
      'web-search',
      'github'
    ]

    for (const skillName of expectedSkills) {
      // 使用精确文本匹配技能名称
      const skill = page.locator(`span.text-sm.font-mono.text-white:has-text("${skillName}")`)
      await expect(skill).toBeVisible({ timeout: 3000 })
    }

    // 验证分类筛选按钮
    const categoryAll = page.locator('button:has-text("全部")')
    await expect(categoryAll).toBeVisible()

    // 步骤 5：测试安装/移除功能
    // 找到一个未安装的技能（通常是 github 或 web-search）
    const installButton = page.locator('button:has-text("安装")').first()

    if (await installButton.isVisible()) {
      // 点击安装
      await installButton.click()

      // 验证按钮变为"移除"
      const removeButton = page.locator('button:has-text("移除")')
      await expect(removeButton.first()).toBeVisible({ timeout: 2000 })

      // 再次点击移除
      await removeButton.first().click()

      // 验证按钮变回"安装"
      await expect(installButton.first()).toBeVisible({ timeout: 2000 })
    }
  })

  // ========================================
  // 额外测试：Quick Actions 快捷操作
  // ========================================
  test('Quick Actions - Workflow 按钮功能', async ({ page }) => {
    // 找到 Quick Actions 区域
    const quickActionsHeader = page.locator('text=🚀 Quick Actions')
    await expect(quickActionsHeader).toBeVisible()

    // 点击 Quick Actions 中的 Workflow 按钮
    const quickWorkflowButton = page.locator('button:has-text("📊 Workflow")').last()
    await quickWorkflowButton.click()

    // 验证工作流编辑器打开
    const modal = page.locator('text=📊 工作流编辑器')
    await expect(modal).toBeVisible({ timeout: 5000 })

    // 关闭弹窗
    const closeButton = page.locator('.fixed button').filter({
      has: page.locator('svg')
    }).first()
    await closeButton.click()
  })
})