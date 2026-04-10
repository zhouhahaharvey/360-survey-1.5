// ============================================
// 360调研系统 - Demo数据 (100个案例)
// 覆盖各种场景、阶段、状态
// ============================================

// 场景名称映射
const SCENE_NAMES = {
    promotion: { name: '晋升评估', icon: '🔷', color: 'blue' },
    probation: { name: '转正评估', icon: '🟢', color: 'green' },
    newleader: { name: '新Leader考察', icon: '🔶', color: 'orange' },
    performance: { name: '绩效考核', icon: '📊', color: 'purple' },
    annual: { name: '年度评估', icon: '📅', color: 'indigo' },
    project: { name: '项目复盘', icon: '🚀', color: 'pink' }
};

// 部门列表
const DEPARTMENTS = ['技术部', '产品部', '设计部', '运营部', '市场部', '销售部', 'HR', '财务部', '法务部'];

// 职级列表
const LEVELS = ['P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'M1', 'M2', 'M3'];

// 员工姓名库
const FIRST_NAMES = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '罗'];
const LAST_NAMES = ['伟', '芳', '娜', '敏', '静', '强', '磊', '洋', '勇', '军', '杰', '娟', '艳', '涛', '明', '超', '秀英', '华', '鹏', '飞', '婷', '宇', '欣', '雨', '晨', '轩', '昊', '瑞', '嘉', '怡'];

// 生成随机姓名
function generateName() {
    const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return first + last;
}

// 生成随机日期
function generateDate(daysAgo = 30) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    return date.toISOString();
}

// 生成截止日期
function generateDeadline(daysFromNow = 30) {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * daysFromNow) - 5);
    return date.toISOString();
}

// 计算剩余天数
function getRemainingDays(deadline) {
    const now = new Date();
    const end = new Date(deadline);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
}

// 获取紧急程度标签
function getUrgency(deadline) {
    const days = getRemainingDays(deadline);
    if (days <= 3) return { level: 'urgent', text: `剩${days}天`, class: 'urgent' };
    if (days <= 7) return { level: 'warning', text: `剩${days}天`, class: 'warning' };
    if (days < 0) return { level: 'expired', text: '已逾期', class: 'danger' };
    return { level: 'normal', text: `剩${days}天`, class: 'normal' };
}

// 生成被评估人
function generateSubject(scene, index) {
    const dept = DEPARTMENTS[index % DEPARTMENTS.length];
    const levelIndex = scene === 'promotion' ? 4 + (index % 3) : // 晋升通常是P7-P9
                       scene === 'probation' ? 1 + (index % 3) : // 转正是P5-P7
                       scene === 'newleader' ? 5 + (index % 2) : // 新Leader是P8-P9
                       2 + (index % 5); // 其他是P6-P9
    const level = LEVELS[Math.min(levelIndex, LEVELS.length - 1)];
    const name = generateName();
    
    return {
        id: `EMP${String(10000 + index).slice(1)}`,
        name: name,
        dept: dept,
        level: level,
        entryDate: generateDate(365 * (2 + Math.floor(Math.random() * 5))),
        evaluators: {
            up: Math.floor(Math.random() * 2) + 1, // 1-2个上级
            peer: Math.floor(Math.random() * 4) + 2, // 2-5个平级
            down: level.includes('M') || parseInt(level.slice(1)) >= 7 ? Math.floor(Math.random() * 4) + 1 : 0 // 管理岗才有下级
        }
    };
}

// ============================================
// 生成100个调研案例
// ============================================
const DEMO_SURVEYS = [];

// 场景分布
const sceneDistribution = [
    { scene: 'promotion', count: 25 },  // 25个晋升评估
    { scene: 'probation', count: 20 },  // 20个转正评估
    { scene: 'newleader', count: 15 },  // 15个新Leader
    { scene: 'performance', count: 25 }, // 25个绩效考核
    { scene: 'annual', count: 10 },     // 10个年度评估
    { scene: 'project', count: 5 }      // 5个项目复盘
];

// 状态分布
const statusDistribution = [
    { status: 'pending_review', weight: 15 },  // 15% 待审核
    { status: 'active', weight: 45 },          // 45% 收集中
    { status: 'completed', weight: 30 },       // 30% 已完成
    { status: 'rejected', weight: 5 },         // 5% 已驳回
    { status: 'terminated', weight: 5 }        // 5% 已终止
];

let surveyIndex = 1;

sceneDistribution.forEach(({ scene, count }) => {
    for (let i = 0; i < count; i++) {
        // 随机选择状态（按权重）
        const random = Math.random() * 100;
        let status = 'active';
        let cumulative = 0;
        for (const s of statusDistribution) {
            cumulative += s.weight;
            if (random <= cumulative) {
                status = s.status;
                break;
            }
        }
        
        // 生成被评估人
        const subjectCount = scene === 'performance' ? Math.floor(Math.random() * 20) + 10 : // 绩效考核人多
                              scene === 'annual' ? Math.floor(Math.random() * 15) + 5 : // 年度评估
                              1; // 其他通常是单人
        
        const subjects = [];
        for (let j = 0; j < subjectCount; j++) {
            subjects.push(generateSubject(scene, surveyIndex + j));
        }
        
        // 计算总评估人数
        const totalEvaluators = subjects.reduce((sum, s) => 
            sum + s.evaluators.up + s.evaluators.peer + s.evaluators.down, 0);
        
        // 根据状态设置进度和提交数
        let submittedCount = 0;
        let progress = 0;
        
        if (status === 'pending_review') {
            progress = 0;
            submittedCount = 0;
        } else if (status === 'completed') {
            progress = 100;
            submittedCount = totalEvaluators;
        } else if (status === 'active') {
            progress = Math.floor(Math.random() * 90) + 5;
            submittedCount = Math.floor(totalEvaluators * progress / 100);
        } else {
            progress = Math.floor(Math.random() * 50);
            submittedCount = Math.floor(totalEvaluators * progress / 100);
        }
        
        // 生成时间节点
        const submittedAt = generateDate(30);
        const deadline = generateDeadline(30);
        const urgency = status === 'active' ? getUrgency(deadline) : 
                       status === 'completed' ? { level: 'completed', text: '已结束', class: 'completed' } :
                       { level: status, text: status === 'pending_review' ? '待审核' : 
                                               status === 'rejected' ? '已驳回' : '已终止', class: status };
        
        // 创建调研对象
        const survey = {
            id: `survey_${String(surveyIndex).padStart(3, '0')}`,
            title: subjects.length === 1 ? 
                `${subjects[0].name}-${SCENE_NAMES[scene].name}` : 
                `${SCENE_NAMES[scene].name}(${subjects.length}人)`,
            scene: scene,
            sceneName: SCENE_NAMES[scene].name,
            sceneIcon: SCENE_NAMES[scene].icon,
            status: status,
            statusText: status === 'pending_review' ? '待审核' :
                       status === 'active' ? '收集中' :
                       status === 'completed' ? '已完成' :
                       status === 'rejected' ? '已驳回' : '已终止',
            subjects: subjects,
            subjectCount: subjects.length,
            evaluatorCount: totalEvaluators,
            submittedCount: submittedCount,
            progress: progress,
            submittedAt: submittedAt,
            submittedBy: generateName(),
            deadline: deadline,
            urgency: urgency,
            hasReport: status === 'completed',
            avgScore: status === 'completed' ? (Math.random() * 1.5 + 3.5).toFixed(1) : null
        };
        
        DEMO_SURVEYS.push(survey);
        surveyIndex++;
    }
});

// ============================================
// 生成评估人待办任务 (50个)
// ============================================
const DEMO_TASKS = [];

const RELATIONS = ['superior', 'peer', 'down'];
const RELATION_NAMES = { superior: '上级评估', peer: '平级评估', down: '下级评估' };

const activeSurveys = DEMO_SURVEYS.filter(s => s.status === 'active');

for (let i = 0; i < 50; i++) {
    if (activeSurveys.length === 0) break;
    const survey = activeSurveys[Math.floor(Math.random() * activeSurveys.length)];
    if (!survey) continue;
    
    const subject = survey.subjects[Math.floor(Math.random() * survey.subjects.length)];
    const relation = RELATIONS[Math.floor(Math.random() * RELATIONS.length)];
    
    // 检查是否有对应关系
    if (relation === 'down' && subject.evaluators.down === 0) continue;
    
    const progress = Math.floor(Math.random() * 100);
    const isCompleted = Math.random() < 0.3; // 30%已完成
    
    DEMO_TASKS.push({
        id: `task_${String(i + 1).padStart(3, '0')}`,
        surveyId: survey.id,
        scene: survey.scene,
        sceneName: survey.sceneName,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectDept: subject.dept,
        subjectLevel: subject.level,
        relation: relation,
        relationName: RELATION_NAMES[relation],
        deadline: survey.deadline,
        progress: isCompleted ? 100 : progress,
        status: isCompleted ? 'completed' : 'pending',
        submittedAt: isCompleted ? generateDate(7) : null
    });
}

// ============================================
// 生成已完成评估记录 (80个)
// ============================================
const DEMO_FEEDBACKS = [];

const completedSurveys = DEMO_SURVEYS.filter(s => s.status === 'completed');

for (let i = 0; i < 80; i++) {
    if (completedSurveys.length === 0) break;
    const survey = completedSurveys[Math.floor(Math.random() * completedSurveys.length)];
    if (!survey) continue;
    
    const subject = survey.subjects[Math.floor(Math.random() * survey.subjects.length)];
    const evaluatorName = generateName();
    
    DEMO_FEEDBACKS.push({
        id: `feedback_${String(i + 1).padStart(3, '0')}`,
        surveyId: survey.id,
        subjectId: subject.id,
        subjectName: subject.name,
        evaluatorName: evaluatorName,
        submittedAt: generateDate(14),
        overallScore: (Math.random() * 2 + 3).toFixed(1),
        dimensions: {
            skill: (Math.random() * 2 + 3).toFixed(1),
            leadership: (Math.random() * 2 + 3).toFixed(1),
            culture: (Math.random() * 2 + 3).toFixed(1),
            execution: (Math.random() * 2 + 3).toFixed(1)
        }
    });
}

// ============================================
// 数据导出函数
// ============================================

// 初始化LocalStorage数据
function initDemoData() {
    // 优先使用 DataStore 初始化（单一数据源）
    if (typeof DataStore !== 'undefined') {
        // 检查是否已初始化
        const existing = DataStore.getAllSurveys();
        if (existing.length === 0) {
            // 为待审核调研添加 submittedBy（确保前 10 个归属当前用户，用于演示）
            let pendingCount = 0;
            const surveysWithSubmitter = DEMO_SURVEYS.map(s => {
                if (s.status === 'pending_review' && pendingCount < 10) {
                    pendingCount++;
                    return {...s, submittedBy: 'current_user'};
                }
                return s;
            });
            DataStore.saveAllSurveys(surveysWithSubmitter);
            console.log('[DataStore] Demo调研数据已初始化:', surveysWithSubmitter.length);
        }
        
        // 初始化评估任务
        const existingTasks = DataStore.getEvaluatorTasks();
        if (existingTasks.length === 0) {
            DataStore.saveEvaluatorTasks(DEMO_TASKS);
        }
        
        // 初始化反馈记录
        const existingFeedbacks = DataStore.getFeedbacks();
        if (existingFeedbacks.length === 0) {
            DataStore.saveFeedbacks(DEMO_FEEDBACKS);
        }
    } else {
        // 降级方案：直接操作 localStorage
        // 待审核列表
        const pendingReviews = DEMO_SURVEYS.filter(s => s.status === 'pending_review');
        localStorage.setItem('pendingReviews', JSON.stringify(pendingReviews));
        
        // 我的待审核（发起人为当前用户）
        const myPendingReviews = pendingReviews.slice(0, 10).map(s => ({
            ...s,
            submittedBy: 'current_user'
        }));
        localStorage.setItem('myPendingReviews', JSON.stringify(myPendingReviews));
        
        // 推送池（待推送的）
        const pushPool = DEMO_SURVEYS.filter(s => s.status === 'active' && s.progress < 50);
        localStorage.setItem('pushPool', JSON.stringify(pushPool));
        
        // 评估任务
        localStorage.setItem('evaluatorTasks', JSON.stringify(DEMO_TASKS));
        
        // 已完成反馈
        localStorage.setItem('feedbacks', JSON.stringify(DEMO_FEEDBACKS));
    }
    
    console.log('Demo数据初始化完成:', {
        surveys: DEMO_SURVEYS.length,
        tasks: DEMO_TASKS.length,
        feedbacks: DEMO_FEEDBACKS.length
    });
}

// 获取各列表数据
function getSurveysByStatus(status) {
    return DEMO_SURVEYS.filter(s => s.status === status);
}

function getSurveysByScene(scene) {
    return DEMO_SURVEYS.filter(s => s.scene === scene);
}

function getSurveysByUrgency(urgency) {
    return DEMO_SURVEYS.filter(s => s.urgency.level === urgency);
}

function getPendingTasks() {
    return DEMO_TASKS.filter(t => t.status === 'pending');
}

function getCompletedTasks() {
    return DEMO_TASKS.filter(t => t.status === 'completed');
}

// 导出供全局使用
if (typeof window !== 'undefined') {
    window.DEMO_SURVEYS = DEMO_SURVEYS;
    window.DEMO_TASKS = DEMO_TASKS;
    window.DEMO_FEEDBACKS = DEMO_FEEDBACKS;
    window.initDemoData = initDemoData;
    window.getSurveysByStatus = getSurveysByStatus;
    window.getSurveysByScene = getSurveysByScene;
    window.getSurveysByUrgency = getSurveysByUrgency;
    window.getPendingTasks = getPendingTasks;
    window.getCompletedTasks = getCompletedTasks;
}

// 如果是Node环境，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEMO_SURVEYS,
        DEMO_TASKS,
        DEMO_FEEDBACKS,
        initDemoData,
        getSurveysByStatus,
        getSurveysByScene,
        getSurveysByUrgency,
        getPendingTasks,
        getCompletedTasks
    };
}

// Auto-init when DOM is ready
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Demo Data] Loaded', DEMO_SURVEYS.length, 'surveys');
    });
}
