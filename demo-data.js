// ============================================
// 360调研系统 - Demo数据 (重构版)
// 完整的HRBP和管理员用户故事链路
// ============================================

// ============================================
// 1. 用户定义
// ============================================
const USERS = {
    hrbp: { id: 'user_hrbp', name: '王HR', role: 'hrbp', dept: 'HR' },
    admin: { id: 'user_admin', name: '张管理', role: 'admin', dept: 'HR' },
    current: { id: 'current_user', name: '当前用户', role: 'hrbp', dept: '技术部' }
};

// ============================================
// 2. 场景配置
// ============================================
// 注意：RELATION_TYPES 已在 common.js 中定义

const SCENE_CONFIG = {
    promotion: { 
        name: '晋升评估', 
        icon: '🔷', 
        color: 'blue',
        dimensions: ['专业能力', '领导力', '文化契合', '发展潜力', '跨团队协作'],
        // 自定义关系类型配置：key是RELATION_TYPES中的key，可自定义label覆盖默认值
        evaluatorRelations: [
            { type: 'up', count: 1, label: '直属Leader' },
            { type: 'cross_dept', count: 2, label: '跨部门高层' },
            { type: 'peer', count: 3, label: '同仁互评' },
            { type: 'hr_partner', count: 1, label: 'HRBP评价' }
        ]
    },
    probation: { 
        name: '转正评估', 
        icon: '🟢', 
        color: 'green',
        dimensions: ['岗位胜任', '团队协作', '学习成长', '文化融入', '工作态度'],
        evaluatorRelations: [
            { type: 'up', count: 1, label: '直属Leader' },
            { type: 'peer', count: 2, label: '师傅/平级' },
            { type: 'hr_partner', count: 1, label: 'HRBP评价' }
        ]
    },
    newleader: { 
        name: '新Leader考察', 
        icon: '🔶', 
        color: 'orange',
        dimensions: ['管理能力', '团队反馈', '业务理解', '沟通协作', '决策能力'],
        evaluatorRelations: [
            { type: 'up', count: 1, label: '上级VP' },
            { type: 'cross_dept', count: 2, label: '协作部门负责人' },
            { type: 'peer', count: 2, label: '其他Leader' },
            { type: 'down', count: 3, label: '团队成员反馈' },
            { type: 'hr_partner', count: 1, label: 'HRBP评价' }
        ]
    },
    performance: { 
        name: '绩效考核', 
        icon: '📊', 
        color: 'purple',
        dimensions: ['目标达成', '协作能力', '价值观践行', '创新能力', '执行效率'],
        evaluatorRelations: [
            { type: 'up', count: 1, label: '直属Leader' },
            { type: 'peer', count: 2, label: '同仁互评' },
            { type: 'project_lead', count: 1, label: '项目负责人' }
        ]
    }
};

// ============================================
// 3. 部门与职级
// ============================================
const DEPARTMENTS = ['技术部', '产品部', '设计部', '运营部', '市场部'];
const LEVELS = ['P4', 'P5', 'P6', 'P7', 'P8', 'M1', 'M2'];

// ============================================
// 4. 员工池（用于生成评估关系）
// ============================================
// 扩展员工池到25+人，支持20+ case
const EMPLOYEE_POOL = [
    // 技术部 (8人)
    { id: 'E001', name: '张三', dept: '技术部', level: 'P7' },
    { id: 'E002', name: '李四', dept: '技术部', level: 'P6' },
    { id: 'E005', name: '孙七', dept: '技术部', level: 'P8' },
    { id: 'E008', name: '郑十', dept: '技术部', level: 'P7' },
    { id: 'E011', name: '刘明', dept: '技术部', level: 'M1' },
    { id: 'E012', name: '黄华', dept: '技术部', level: 'P6' },
    { id: 'E016', name: '彭磊', dept: '技术部', level: 'P7' },
    { id: 'E017', name: '许静', dept: '技术部', level: 'P5' },
    // 产品部 (5人)
    { id: 'E003', name: '王五', dept: '产品部', level: 'P5' },
    { id: 'E009', name: '钱十一', dept: '产品部', level: 'P8' },
    { id: 'E013', name: '林小丽', dept: '产品部', level: 'P5' },
    { id: 'E018', name: '沈洋', dept: '产品部', level: 'P6' },
    { id: 'E019', name: '韩梅', dept: '产品部', level: 'M2' },
    // 设计部 (4人)
    { id: 'E004', name: '赵六', dept: '设计部', level: 'P6' },
    { id: 'E010', name: '陈十二', dept: '设计部', level: 'P5' },
    { id: 'E020', name: '杨青', dept: '设计部', level: 'P7' },
    { id: 'E021', name: '朱雪', dept: '设计部', level: 'P5' },
    // 运营部 (4人)
    { id: 'E006', name: '周八', dept: '运营部', level: 'P5' },
    { id: 'E014', name: '何伟', dept: '运营部', level: 'P7' },
    { id: 'E022', name: '秦朝', dept: '运营部', level: 'P6' },
    { id: 'E023', name: '叶卉', dept: '运营部', level: 'P5' },
    // 市场部 (4人)
    { id: 'E007', name: '吴九', dept: '市场部', level: 'P6' },
    { id: 'E015', name: '高强', dept: '市场部', level: 'P6' },
    { id: 'E024', name: '田亞', dept: '市场部', level: 'P5' },
    { id: 'E025', name: '范雨', dept: '市场部', level: 'M1' }
];

// ============================================
// 5. 评估人池 - 包含完整基础信息
// ============================================
const EVALUATOR_POOL = [
    // 技术部 - 高层管理者
    { id: 'V001', name: '王技术VP', dept: '技术部', level: 'M3', title: '技术VP', role: 'high_level_manager', email: 'wangvp@company.com', empId: 'T001' },
    { id: 'V002', name: '李架构师', dept: '技术部', level: 'P8', title: '首席架构师', role: 'tech_expert', email: 'liarch@company.com', empId: 'T002' },
    { id: 'V003', name: '张技术总监', dept: '技术部', level: 'M2', title: '技术总监', role: 'manager', email: 'zhangdir@company.com', empId: 'T003' },
    { id: 'V004', name: '刘前端专家', dept: '技术部', level: 'P7', title: '高级前端工程师', role: 'senior_engineer', email: 'liufe@company.com', empId: 'T004' },
    { id: 'V005', name: '陈后端专家', dept: '技术部', level: 'P7', title: '高级后端工程师', role: 'senior_engineer', email: 'chenbe@company.com', empId: 'T005' },
    
    // 产品部
    { id: 'V006', name: '郑产品VP', dept: '产品部', level: 'M3', title: '产品VP', role: 'high_level_manager', email: 'zhengvp@company.com', empId: 'P001' },
    { id: 'V007', name: '黄产品总监', dept: '产品部', level: 'M2', title: '产品总监', role: 'manager', email: 'huangdir@company.com', empId: 'P002' },
    { id: 'V008', name: '赵高级PM', dept: '产品部', level: 'P7', title: '高级产品经理', role: 'senior_pm', email: 'zhaopm@company.com', empId: 'P003' },
    { id: 'V009', name: '钱PM', dept: '产品部', level: 'P6', title: '产品经理', role: 'pm', email: 'qianpm@company.com', empId: 'P004' },
    
    // 设计部
    { id: 'V010', name: '孙设计VP', dept: '设计部', level: 'M3', title: '设计VP', role: 'high_level_manager', email: 'sunvp@company.com', empId: 'D001' },
    { id: 'V011', name: '周设计总监', dept: '设计部', level: 'M2', title: '设计总监', role: 'manager', email: 'zhoudir@company.com', empId: 'D002' },
    { id: 'V012', name: '吴高级设计师', dept: '设计部', level: 'P7', title: '高级交互设计师', role: 'senior_designer', email: 'wudesign@company.com', empId: 'D003' },
    
    // 运营部
    { id: 'V013', name: '郑运营VP', dept: '运营部', level: 'M3', title: '运营VP', role: 'high_level_manager', email: 'zhengop@company.com', empId: 'O001' },
    { id: 'V014', name: '王运营总监', dept: '运营部', level: 'M2', title: '运营总监', role: 'manager', email: 'wangop@company.com', empId: 'O002' },
    { id: 'V015', name: '胡运营专家', dept: '运营部', level: 'P7', title: '高级运营经理', role: 'senior_ops', email: 'huops@company.com', empId: 'O003' },
    
    // 市场部
    { id: 'V016', name: '林市场VP', dept: '市场部', level: 'M3', title: '市场VP', role: 'high_level_manager', email: 'linmkt@company.com', empId: 'M001' },
    { id: 'V017', name: '何市场总监', dept: '市场部', level: 'M2', title: '市场总监', role: 'manager', email: 'hemkt@company.com', empId: 'M002' },
    { id: 'V018', name: '郑市场专家', dept: '市场部', level: 'P7', title: '高级市场经理', role: 'senior_marketing', email: 'zhengpm@company.com', empId: 'M003' },
    
    // HR部
    { id: 'V019', name: '刘HRD', dept: 'HR', level: 'M3', title: 'HRD', role: 'hr_director', email: 'liuhrd@company.com', empId: 'H001' },
    { id: 'V020', name: '陈HRBP', dept: 'HR', level: 'M2', title: '高级HRBP', role: 'hrbp', email: 'chenhrbp@company.com', empId: 'H002' },
    { id: 'V021', name: '黄HRBP', dept: 'HR', level: 'P7', title: 'HRBP', role: 'hrbp', email: 'huanghrbp@company.com', empId: 'H003' },
    
    // 项目管理
    { id: 'V022', name: '李项目总监', dept: '技术部', level: 'M2', title: '项目总监', role: 'project_manager', email: 'liproj@company.com', empId: 'J001' },
    { id: 'V023', name: '周PMO', dept: '技术部', level: 'P7', title: 'PMO专家', role: 'pmo', email: 'zhoupmo@company.com', empId: 'J002' },
    
    // 外部/其他
    { id: 'V024', name: '孙大客户', dept: '外部', level: '-', title: '重点客户代表', role: 'external_client', email: 'sunclient@partner.com', empId: 'E001' },
    { id: 'V025', name: '吴合作伙伴', dept: '外部', level: '-', title: '战略合作伙伴', role: 'external_partner', email: 'wupartner@partner.com', empId: 'E002' }
];

// ============================================
// 6. 工具函数
// ============================================
function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

function formatDate(date) {
    // 确保是 Date 对象
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    // 检查是否有效日期
    if (isNaN(date.getTime())) {
        return new Date().toISOString();
    }
    return date.toISOString();
}

function daysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
}

function daysFromNow(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
}

function getUrgency(deadline) {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { level: 'expired', text: '已逾期', class: 'danger' };
    if (days <= 3) return { level: 'urgent', text: `剩${days}天`, class: 'urgent' };
    if (days <= 7) return { level: 'warning', text: `剩${days}天`, class: 'warning' };
    return { level: 'normal', text: `剩${days}天`, class: 'normal' };
}

// ============================================
// 7. 创建被评估人（包含实际评估人列表 - 支持自定义关系类型）
// ============================================
// 获取 RELATION_TYPES（兼容 common.js 未加载的情况）
function getRelationTypeLabel(type) {
    if (typeof RELATION_TYPES !== 'undefined' && RELATION_TYPES[type]) {
        return RELATION_TYPES[type].label;
    }
    // 默认标签
    const defaults = { up: '上级', peer: '平级', down: '下级', cross_dept: '横向部门', hr_partner: 'HRBP', project_lead: '项目负责人', external: '外部客户' };
    return defaults[type] || type;
}

function createSubject(employee, scene) {
    const config = SCENE_CONFIG[scene];
    const evaluators = EVALUATOR_POOL;
    
    // 新版：使用 evaluatorRelations 配置
    const evaluatorRelations = config.evaluatorRelations || [
        { type: 'up', count: config.evaluators?.up || 1 },
        { type: 'peer', count: config.evaluators?.peer || 2 },
        { type: 'down', count: config.evaluators?.down || 0 }
    ];
    
    // 按关系类型分组存储评估人
    const assignedEvaluators = {};
    let evaluatorIndex = 0;
    
    // 为每种关系类型分配评估人
    evaluatorRelations.forEach(relConfig => {
        const relationType = relConfig.type;
        const count = relConfig.count || 0;
        const customLabel = relConfig.label;
        
        if (!assignedEvaluators[relationType]) {
            assignedEvaluators[relationType] = [];
        }
        
        // 为该关系类型分配评估人
        for (let i = 0; i < count && evaluatorIndex < evaluators.length; i++) {
            const evaluator = { 
                ...evaluators[evaluatorIndex++], 
                relation: relationType,
                relationLabel: customLabel || getRelationTypeLabel(relationType)
            };
            assignedEvaluators[relationType].push(evaluator);
        }
    });
    
    return {
        ...employee,
        evaluators: assignedEvaluators,
        // 保留兼容性
        _evaluatorRelations: evaluatorRelations
    };
}

// 获取调研使用的关系类型配置
function getEvaluatorRelations(scene) {
    const config = SCENE_CONFIG[scene];
    if (!config) return [];
    
    return config.evaluatorRelations || [
        { type: 'up', count: config.evaluators?.up || 1, label: getRelationTypeLabel('up') },
        { type: 'peer', count: config.evaluators?.peer || 2, label: getRelationTypeLabel('peer') },
        { type: 'down', count: config.evaluators?.down || 0, label: getRelationTypeLabel('down') }
    ];
}

// ============================================
// 8. 创建评估任务（使用subject中已分配的评估人）
// ============================================
function createEvaluatorTasks(survey, subjects) {
    const tasks = [];
    
    subjects.forEach((subject, idx) => {
        // Use the evaluators already assigned to the subject
        const { up = [], peer = [], down = [] } = subject.evaluators || {};
        
        // Up evaluators
        up.forEach((evaluator, i) => {
            tasks.push({
                id: `task_${survey.id}_${subject.id}_up_${i}`,
                surveyId: survey.id,
                scene: survey.scene,
                sceneName: survey.sceneName,
                subjectId: subject.id,
                subjectName: subject.name,
                subjectDept: subject.dept,
                subjectLevel: subject.level,
                relation: 'superior',
                relationName: '上级评估',
                evaluatorId: evaluator.id,
                evaluatorName: evaluator.name,
                deadline: survey.deadline,
                status: 'pending',
                progress: 0
            });
        });
        
        // Peer evaluators
        peer.forEach((evaluator, i) => {
            tasks.push({
                id: `task_${survey.id}_${subject.id}_peer_${i}`,
                surveyId: survey.id,
                scene: survey.scene,
                sceneName: survey.sceneName,
                subjectId: subject.id,
                subjectName: subject.name,
                subjectDept: subject.dept,
                subjectLevel: subject.level,
                relation: 'peer',
                relationName: '平级评估',
                evaluatorId: evaluator.id,
                evaluatorName: evaluator.name,
                deadline: survey.deadline,
                status: 'pending',
                progress: 0
            });
        });
        
        // Down evaluators (for managers)
        down.forEach((evaluator, i) => {
            tasks.push({
                id: `task_${survey.id}_${subject.id}_down_${i}`,
                surveyId: survey.id,
                scene: survey.scene,
                sceneName: survey.sceneName,
                subjectId: subject.id,
                subjectName: subject.name,
                subjectDept: subject.dept,
                subjectLevel: subject.level,
                relation: 'down',
                relationName: '下级评估',
                evaluatorId: evaluator.id,
                evaluatorName: evaluator.name,
                deadline: survey.deadline,
                status: 'pending',
                progress: 0
            });
        });
    });
    
    return tasks;
}

// ============================================
// 9. 创建反馈记录
// ============================================
function createFeedbacks(survey, tasks) {
    return tasks.map(task => ({
        id: `feedback_${task.id}`,
        surveyId: survey.id,
        taskId: task.id,
        subjectId: task.subjectId,
        subjectName: task.subjectName,
        evaluatorId: task.evaluatorId,
        evaluatorName: task.evaluatorName,
        relation: task.relation,
        submittedAt: formatDate(daysAgo(Math.floor(Math.random() * 10))),
        overallScore: (Math.random() * 2 + 3).toFixed(1),
        dimensions: {
            skill: (Math.random() * 2 + 3).toFixed(1),
            leadership: (Math.random() * 2 + 3).toFixed(1),
            culture: (Math.random() * 2 + 3).toFixed(1),
            execution: (Math.random() * 2 + 3).toFixed(1)
        },
        strengths: ['专业能力突出', '团队协作良好', '执行力强'],
        improvements: ['时间管理可提升', '跨部门沟通需加强']
    }));
}

// ============================================
// 10. 构建完整的用户故事数据
// ============================================

// === 故事 A: 已完成调研 (HRBP创建 → 管理员审核 → 已结束) ===
function createCompletedStory(index) {
    const scene = ['promotion', 'probation', 'newleader', 'performance'][index % 4];
    const config = SCENE_CONFIG[scene];
    const subject = createSubject(EMPLOYEE_POOL[index], scene);
    
    const createdAt = daysAgo(30);
    const submittedAt = daysAgo(28);
    const approvedAt = daysAgo(27);
    const deadline = daysFromNow(-5); // Already ended
    const completedAt = daysAgo(3);
    
    const survey = {
        id: `survey_completed_${index}`,
        title: `${subject.name}-${config.name}`,
        scene: scene,
        sceneName: config.name,
        sceneIcon: config.icon,
        status: 'completed',
        statusText: '已完成',
        subjects: [subject],
        subjectCount: 1,
        createdAt: formatDate(createdAt),
        submittedAt: formatDate(submittedAt),
        submittedBy: 'current_user',
        approvedAt: formatDate(approvedAt),
        approvedBy: 'user_admin',
        deadline: formatDate(deadline),
        completedAt: formatDate(completedAt),
        progress: 100,
        hasReport: true,
        avgScore: (Math.random() * 1.5 + 3.5).toFixed(1)
    };
    
    // Create all tasks as completed
    const tasks = createEvaluatorTasks(survey, [subject]).map(t => ({
        ...t,
        status: 'completed',
        progress: 100,
        submittedAt: formatDate(daysAgo(Math.floor(Math.random() * 20) + 3))
    }));
    
    const feedbacks = createFeedbacks(survey, tasks);
    
    return { survey, tasks, feedbacks };
}

// === 故事 B: 进行中调研 (HRBP创建 → 管理员审核 → 收集中) ===
function createActiveStory(index) {
    const scene = ['promotion', 'probation', 'performance'][index % 3];
    const config = SCENE_CONFIG[scene];
    const subject = createSubject(EMPLOYEE_POOL[index + 4], scene);
    
    const createdAt = daysAgo(15);
    const submittedAt = daysAgo(14);
    const approvedAt = daysAgo(13);
    const deadline = daysFromNow(7);
    
    const tasks = createEvaluatorTasks({ scene, sceneName: config.name, deadline }, [subject]);
    
    // Mark 60% as completed
    const completedCount = Math.floor(tasks.length * 0.6);
    tasks.forEach((task, i) => {
        if (i < completedCount) {
            task.status = 'completed';
            task.progress = 100;
            task.submittedAt = formatDate(daysAgo(Math.floor(Math.random() * 10)));
        }
    });
    
    const progress = Math.round((completedCount / tasks.length) * 100);
    
    const survey = {
        id: `survey_active_${index}`,
        title: `${subject.name}-${config.name}`,
        scene: scene,
        sceneName: config.name,
        sceneIcon: config.icon,
        status: 'active',
        statusText: '收集中',
        subjects: [subject],
        subjectCount: 1,
        evaluatorCount: tasks.length,
        submittedCount: completedCount,
        progress: progress,
        createdAt: formatDate(createdAt),
        submittedAt: formatDate(submittedAt),
        submittedBy: 'current_user',
        approvedAt: formatDate(approvedAt),
        approvedBy: 'user_admin',
        deadline: formatDate(deadline),
        urgency: getUrgency(deadline),
        hasReport: false
    };
    
    // Update task surveyId
    tasks.forEach(t => t.surveyId = survey.id);
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const feedbacks = createFeedbacks(survey, completedTasks);
    
    return { survey, tasks, feedbacks };
}

// === 故事 C: 待审核调研 (HRBP创建 → 等待管理员审核) ===
function createPendingReviewStory(index) {
    const scene = ['promotion', 'newleader', 'performance'][index % 3];
    const config = SCENE_CONFIG[scene];
    const subject = createSubject(EMPLOYEE_POOL[index + 8], scene);
    
    const createdAt = daysAgo(3);
    const submittedAt = daysAgo(1);
    const deadline = daysFromNow(14);
    
    const tasks = createEvaluatorTasks({ scene, sceneName: config.name, deadline }, [subject]);
    
    const survey = {
        id: `survey_pending_${index}`,
        title: `${subject.name}-${config.name}`,
        scene: scene,
        sceneName: config.name,
        sceneIcon: config.icon,
        status: 'pending_review',
        statusText: '待审核',
        subjects: [subject],
        subjectCount: 1,
        evaluatorCount: tasks.length,
        submittedCount: 0,
        progress: 0,
        createdAt: formatDate(createdAt),
        submittedAt: formatDate(submittedAt),
        submittedBy: 'current_user',
        deadline: formatDate(deadline),
        urgency: getUrgency(deadline),
        hasReport: false
    };
    
    return { survey, tasks: [], feedbacks: [] };
}

// === 故事 D: 草稿调研 (HRBP创建中) ===
function createDraftStory(index) {
    const scene = ['promotion', 'probation'][index % 2];
    const config = SCENE_CONFIG[scene];
    const subject = createSubject(EMPLOYEE_POOL[index + 12], scene);
    
    const survey = {
        id: `survey_draft_${index}`,
        title: `${subject.name}-${config.name}(草稿)`,
        scene: scene,
        sceneName: config.name,
        sceneIcon: config.icon,
        status: 'draft',
        statusText: '草稿',
        subjects: [subject],
        subjectCount: 1,
        progress: 0,
        createdAt: formatDate(daysAgo(2)),
        submittedBy: 'current_user',
        deadline: formatDate(daysFromNow(21)),
        hasReport: false
    };
    
    return { survey, tasks: [], feedbacks: [] };
}

// === 故事 E: 待推送池调研 (已审核，等待批量推送) ===
// 创建多样化的待推送案例，覆盖不同场景、部门、职级组合
function createPushPoolStory(index) {
    // 多样化配置：场景、员工索引、提交人
    const configs = [
        { scene: 'promotion', empIdx: 0, submitter: 'current_user', dept: '技术部' },      // 张三-晋升-P7
        { scene: 'newleader', empIdx: 2, submitter: 'user_hrbp', dept: '产品部' },        // 王五-新Leader-P5
        { scene: 'probation', empIdx: 4, submitter: 'current_user', dept: '技术部' },       // 孙七-转正-P8
        { scene: 'performance', empIdx: 6, submitter: 'user_hrbp', dept: '运营部' },      // 周八-绩效-P5
        { scene: 'promotion', empIdx: 8, submitter: 'current_user', dept: '技术部' },      // 郑十-晋升-P7
        { scene: 'newleader', empIdx: 10, submitter: 'user_admin', dept: '技术部' },      // 刘明-新Leader-M1
        { scene: 'probation', empIdx: 12, submitter: 'current_user', dept: '技术部' },     // 黄华-转正-P6
        { scene: 'performance', empIdx: 14, submitter: 'user_hrbp', dept: '运营部' },     // 何伟-绩效-P7
        { scene: 'promotion', empIdx: 16, submitter: 'current_user', dept: '技术部' },     // 彭磊-晋升-P7
        { scene: 'newleader', empIdx: 18, submitter: 'user_admin', dept: '产品部' },      // 沈洋-新Leader-P6
        { scene: 'probation', empIdx: 20, submitter: 'current_user', dept: '设计部' },     // 杨青-转正-P7
        { scene: 'performance', empIdx: 22, submitter: 'user_hrbp', dept: '运营部' }      // 秦朝-绩效-P6
    ];
    
    const cfg = configs[index % configs.length];
    const sceneConfig = SCENE_CONFIG[cfg.scene];
    const subject = createSubject(EMPLOYEE_POOL[cfg.empIdx], cfg.scene);
    
    // 创建评估任务
    const tasks = createEvaluatorTasks({ 
        scene: cfg.scene, 
        sceneName: sceneConfig.name, 
        deadline: formatDate(daysFromNow(10 + index))
    }, [subject]);
    
    const survey = {
        id: `survey_pushpool_${index}`,
        title: `${subject.name}-${sceneConfig.name}`,
        scene: cfg.scene,
        sceneName: sceneConfig.name,
        sceneIcon: sceneConfig.icon,
        status: 'relation_approved',
        statusText: '待推送',
        subjects: [subject],
        subjectCount: 1,
        evaluatorCount: tasks.length,
        submittedCount: 0,
        progress: 0,
        createdAt: formatDate(daysAgo(5)),
        submittedAt: formatDate(daysAgo(3)),
        submittedBy: cfg.submitter,
        approvedAt: formatDate(daysAgo(2)),
        approvedBy: 'user_admin',
        deadline: formatDate(daysFromNow(10 + index)),
        urgency: getUrgency(daysFromNow(10 + index)),
        hasReport: false,
        pushType: 'batch',  // 关键字段：批量推送
        poolEntryAt: formatDate(daysAgo(2))  // 进入待推送池时间
    };
    
    return { survey, tasks, feedbacks: [] };
}

// === 故事 E: 我的待办任务 (当前用户作为评估人) ===
function createMyTasks() {
    const tasks = [];
    const myId = 'current_user';
    
    // 3 pending tasks for current user
    for (let i = 0; i < 3; i++) {
        const scene = ['promotion', 'probation', 'newleader'][i];
        const config = SCENE_CONFIG[scene];
        const subject = EMPLOYEE_POOL[i + 5];
        
        tasks.push({
            id: `task_my_${i}`,
            surveyId: `survey_active_${i}`,
            scene: scene,
            sceneName: config.name,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectDept: subject.dept,
            subjectLevel: subject.level,
            relation: ['peer', 'superior', 'down'][i],
            relationName: ['平级评估', '上级评估', '下级评估'][i],
            evaluatorId: myId,
            evaluatorName: '我',
            deadline: formatDate(daysFromNow(7 - i)),
            status: 'pending',
            progress: 0
        });
    }
    
    // 2 completed tasks
    for (let i = 0; i < 2; i++) {
        const scene = ['performance', 'promotion'][i];
        const config = SCENE_CONFIG[scene];
        const subject = EMPLOYEE_POOL[i + 10];
        
        tasks.push({
            id: `task_my_completed_${i}`,
            surveyId: `survey_completed_${i}`,
            scene: scene,
            sceneName: config.name,
            subjectId: subject.id,
            subjectName: subject.name,
            subjectDept: subject.dept,
            subjectLevel: subject.level,
            relation: 'peer',
            relationName: '平级评估',
            evaluatorId: myId,
            evaluatorName: '我',
            deadline: formatDate(daysAgo(5)),
            status: 'completed',
            progress: 100,
            submittedAt: formatDate(daysAgo(7))
        });
    }
    
    return tasks;
}

// ============================================
// 11. 生成所有Demo数据
// ============================================
const DEMO_SURVEYS = [];
const DEMO_TASKS = [];
const DEMO_FEEDBACKS = [];

// Generate stories - 扩展到20+ case，覆盖各种场景
const stories = [
    // 4 completed surveys
    createCompletedStory(0),
    createCompletedStory(1),
    createCompletedStory(2),
    createCompletedStory(3),
    
    // 5 active surveys
    createActiveStory(0),
    createActiveStory(1),
    createActiveStory(2),
    createActiveStory(3),
    createActiveStory(4),
    
    // 12 pending review surveys (多样场景覆盖)
    createPendingReviewStory(0),  // promotion - 钱十一
    createPendingReviewStory(1),  // newleader - 陈十二
    createPendingReviewStory(2),  // performance - 刘明
    createPendingReviewStory(3),  // promotion - 黄华
    createPendingReviewStory(4),  // probation - 林小丽
    createPendingReviewStory(5),  // newleader - 何伟
    createPendingReviewStory(6),  // performance - 高强
    createPendingReviewStory(7),  // promotion - 彭磊
    createPendingReviewStory(8),  // newleader - 许静
    createPendingReviewStory(9),  // performance - 沈洋
    createPendingReviewStory(10), // promotion - 韩梅
    createPendingReviewStory(11), // probation - 杨青
    
    // 12 待推送池调研 (已审核，等待批量推送)
    createPushPoolStory(0),   // 张三-晋升-技术部-P7
    createPushPoolStory(1),   // 王五-新Leader-产品部-P5
    createPushPoolStory(2),   // 孙七-转正-技术部-P8
    createPushPoolStory(3),   // 周八-绩效-运营部-P5
    createPushPoolStory(4),   // 郑十-晋升-技术部-P7
    createPushPoolStory(5),   // 刘明-新Leader-技术部-M1
    createPushPoolStory(6),   // 黄华-转正-技术部-P6
    createPushPoolStory(7),   // 何伟-绩效-运营部-P7
    createPushPoolStory(8),   // 彭磊-晋升-技术部-P7
    createPushPoolStory(9),   // 沈洋-新Leader-产品部-P6
    createPushPoolStory(10),  // 杨青-转正-设计部-P7
    createPushPoolStory(11),  // 秦朝-绩效-运营部-P6
    
    // 3 draft surveys
    createDraftStory(0),
    createDraftStory(1),
    createDraftStory(2)
];

stories.forEach(story => {
    DEMO_SURVEYS.push(story.survey);
    DEMO_TASKS.push(...story.tasks);
    DEMO_FEEDBACKS.push(...story.feedbacks);
});

// Add my tasks
DEMO_TASKS.push(...createMyTasks());

// ============================================
// 12. 初始化函数
// ============================================
function initDemoData() {
    // Clear existing data first
    localStorage.removeItem('allSurveys');
    localStorage.removeItem('evaluatorTasks');
    localStorage.removeItem('feedbacks');
    localStorage.removeItem('pendingReviews');
    localStorage.removeItem('myPendingReviews');
    localStorage.removeItem('pushPool');
    
    // Use DataStore if available
    if (typeof DataStore !== 'undefined') {
        DataStore.saveAllSurveys(DEMO_SURVEYS);
        DataStore.saveEvaluatorTasks(DEMO_TASKS);
        DataStore.saveFeedbacks(DEMO_FEEDBACKS);
    } else {
        // Direct localStorage fallback
        localStorage.setItem('allSurveys', JSON.stringify(DEMO_SURVEYS));
        localStorage.setItem('evaluatorTasks', JSON.stringify(DEMO_TASKS));
        localStorage.setItem('feedbacks', JSON.stringify(DEMO_FEEDBACKS));
    }
    
    // Also save to legacy keys for backward compatibility
    localStorage.setItem('pendingReviews', JSON.stringify(DEMO_SURVEYS.filter(s => s.status === 'pending_review')));
    localStorage.setItem('myPendingReviews', JSON.stringify(DEMO_SURVEYS.filter(s => s.status === 'pending_review' && s.submittedBy === 'current_user')));
    localStorage.setItem('pushPool', JSON.stringify(DEMO_SURVEYS.filter(s => s.status === 'active' && s.progress < 50)));
    
    console.log('[Demo Data] Initialized:', {
        surveys: DEMO_SURVEYS.length,
        tasks: DEMO_TASKS.length,
        feedbacks: DEMO_FEEDBACKS.length
    });
    
    console.log('[Demo Data] Survey breakdown:', {
        completed: DEMO_SURVEYS.filter(s => s.status === 'completed').length,
        active: DEMO_SURVEYS.filter(s => s.status === 'active').length,
        pending_review: DEMO_SURVEYS.filter(s => s.status === 'pending_review').length,
        draft: DEMO_SURVEYS.filter(s => s.status === 'draft').length
    });
}

// ============================================
// 13. 导出
// ============================================
if (typeof window !== 'undefined') {
    window.DEMO_SURVEYS = DEMO_SURVEYS;
    window.DEMO_TASKS = DEMO_TASKS;
    window.DEMO_FEEDBACKS = DEMO_FEEDBACKS;
    window.initDemoData = initDemoData;
    window.USERS = USERS;
    window.SCENE_CONFIG = SCENE_CONFIG;
    window.EMPLOYEE_POOL = EMPLOYEE_POOL;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEMO_SURVEYS,
        DEMO_TASKS,
        DEMO_FEEDBACKS,
        initDemoData,
        USERS,
        SCENE_CONFIG
    };
}

// Auto-init
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Demo Data] v2.0 Loaded');
    });
}
