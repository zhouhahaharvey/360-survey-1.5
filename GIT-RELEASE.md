# Git 发布指南 - v1.3

## 发布步骤

### 1. 准备代码
```bash
# 确保v1.3目录完整
cd 360-survey-v1.3
ls -la

# 检查关键文件
ls admin/
ls respondent/
ls public/
```

### 2. 提交到Git
```bash
# 初始化（如果是新仓库）
git init

# 添加所有文件
git add .

# 提交
git commit -m "release: v1.3 - 优化员工端体验，重构个人中心

主要更新：
- 员工端底部导航简化为3项（待办/历史/我的）
- 个人中心重构，合并成就中心
- 新增历史记录页面，按月份分类
- 优化批量操作功能（终止/催办）
- 完善筛选功能（状态/场景/部门/时间）
- 新增管理员系统管理页面
- 新增报告在线编辑器（PDF/PNG/Word导出）

新增文件：
- admin/admin-management.html
- admin/report-editor.html
- respondent/history.html
- respondent/profile.html
- PRD.md
"

# 打标签
git tag -a v1.3 -m "v1.3 release"

# 推送
git push origin main
git push origin v1.3
```

### 3. 发布检查清单

- [ ] 所有HTML文件可正常访问
- [ ] 底部导航链接正确
- [ ] 版本号已更新为v1.3
- [ ] README.md已更新
- [ ] PRD.md已创建
- [ ] Git标签已推送

### 4. 文件结构验证

```
360-survey-v1.3/
├── index.html
├── README.md
├── PRD.md
├── GIT-RELEASE.md
├── admin/
│   ├── dashboard.html
│   ├── create-survey-step1.html
│   ├── create-survey-step2.html
│   ├── create-survey-step3.html
│   ├── create-survey-step4.html
│   ├── create-survey-batch.html
│   ├── survey-list.html
│   ├── reports.html
│   ├── templates.html
│   ├── admin-management.html
│   └── report-editor.html
├── respondent/
│   ├── todo-list.html
│   ├── history.html
│   ├── profile.html
│   ├── achievements.html
│   ├── batch-survey.html
│   ├── survey-form.html
│   └── success.html
└── public/
    └── wecom-messages.html
```

### 5. 测试要点

1. **员工端导航**
   - 待办 → 历史 → 我的 切换正常
   - 底部导航3项显示正确

2. **个人中心**
   - 徽章显示正常
   - 证书列表正常
   - 统计数据正确

3. **管理端**
   - ?admin=true 参数生效
   - 批量终止功能正常
   - 筛选功能正常

4. **报告编辑器**
   - PDF导出正常
   - PNG导出正常
   - Word导出正常

---

## 发布版本

- **版本号**: v1.3
- **发布日期**: 2026-03-25
- **Git标签**: v1.3
