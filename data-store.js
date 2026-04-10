// ============================================
// 360调研系统 - 统一数据存储层
// 单一数据源，派生视图
// ============================================

const DataStore = {
    // ============================================
    // 基础数据操作
    // ============================================
    
    // 获取所有调研（唯一数据源）
    getAllSurveys() {
        try {
            const data = localStorage.getItem('allSurveys');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.warn('DataStore: Error loading surveys', e);
            return [];
        }
    },
    
    // 保存所有调研
    saveAllSurveys(surveys) {
        try {
            localStorage.setItem('allSurveys', JSON.stringify(surveys));
            return true;
        } catch (e) {
            console.warn('DataStore: Error saving surveys', e);
            return false;
        }
    },
    
    // 获取单个调研
    getSurvey(id) {
        if (!id) return null;
        return this.getAllSurveys().find(s => s.id === id);
    },
    
    // 添加调研
    addSurvey(survey) {
        const surveys = this.getAllSurveys();
        surveys.push(survey);
        this.saveAllSurveys(surveys);
        return survey;
    },
    
    // 更新调研
    updateSurvey(id, updates) {
        if (!id || !updates) return null;
        const surveys = this.getAllSurveys();
        const index = surveys.findIndex(s => s.id === id);
        if (index !== -1) {
            surveys[index] = { ...surveys[index], ...updates };
            this.saveAllSurveys(surveys);
            return surveys[index];
        }
        return null;
    },
    
    // 删除调研
    deleteSurvey(id) {
        if (!id) return false;
        const surveys = this.getAllSurveys();
        const filtered = surveys.filter(s => s.id !== id);
        this.saveAllSurveys(filtered);
        return filtered.length < surveys.length;
    },
    
    // ============================================
    // 派生视图 - 根据状态过滤
    // ============================================
    
    // 待审核列表（所有）
    getPendingReviews() {
        return this.getAllSurveys().filter(s => s.status === 'pending_review');
    },
    
    // 我的待审核
    getMyPendingReviews() {
        return this.getAllSurveys().filter(s => 
            s.status === 'pending_review' && s.submittedBy === 'current_user'
        );
    },
    
    // 进行中的调研
    getActiveSurveys() {
        return this.getAllSurveys().filter(s => s.status === 'active');
    },
    
    // 已完成的调研
    getCompletedSurveys() {
        return this.getAllSurveys().filter(s => s.status === 'completed');
    },
    
    // 待推送池（已审核通过且设置为批量推送）
    getPushPool() {
        return this.getAllSurveys().filter(s => 
            s.status === 'relation_approved' && s.pushType === 'batch'
        );
    },
    
    // 按场景过滤
    getSurveysByScene(scene) {
        return this.getAllSurveys().filter(s => s.scene === scene);
    },
    
    // 按状态过滤
    getSurveysByStatus(status) {
        return this.getAllSurveys().filter(s => s.status === status);
    },
    
    // ============================================
    // 统计数据
    // ============================================
    
    getStats() {
        const surveys = this.getAllSurveys();
        return {
            total: surveys.length,
            pending: surveys.filter(s => s.status === 'pending_review').length,
            active: surveys.filter(s => s.status === 'active').length,
            completed: surveys.filter(s => s.status === 'completed').length,
            rejected: surveys.filter(s => s.status === 'rejected').length,
            myPending: this.getMyPendingReviews().length
        };
    },
    
    // ============================================
    // 评估任务相关
    // ============================================
    
    getEvaluatorTasks() {
        const data = localStorage.getItem('evaluatorTasks');
        return data ? JSON.parse(data) : [];
    },
    
    saveEvaluatorTasks(tasks) {
        localStorage.setItem('evaluatorTasks', JSON.stringify(tasks));
    },
    
    // ============================================
    // 反馈记录相关
    // ============================================
    
    getFeedbacks() {
        const data = localStorage.getItem('feedbacks');
        return data ? JSON.parse(data) : [];
    },
    
    saveFeedbacks(feedbacks) {
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    },
    
    // ============================================
    // 初始化数据
    // ============================================
    
    initDemoData(forceRefresh = false) {
        if (typeof DEMO_SURVEYS !== 'undefined' && DEMO_SURVEYS.length > 0) {
            const existing = this.getAllSurveys();
            // 如果强制刷新或数据为空或数据量变化，则重新初始化
            if (forceRefresh || existing.length === 0 || existing.length !== DEMO_SURVEYS.length) {
                // 先清除旧数据
                localStorage.removeItem('allSurveys');
                localStorage.removeItem('evaluatorTasks');
                localStorage.removeItem('feedbacks');
                localStorage.removeItem('pendingReviews');
                localStorage.removeItem('myPendingReviews');
                localStorage.removeItem('pushPool');
                
                // 保存新数据
                this.saveAllSurveys(DEMO_SURVEYS);
                console.log('[DataStore] Demo数据已初始化:', DEMO_SURVEYS.length, '条调研');
                
                // 同步到兼容键
                localStorage.setItem('pendingReviews', JSON.stringify(DEMO_SURVEYS.filter(s => s.status === 'pending_review')));
                localStorage.setItem('myPendingReviews', JSON.stringify(DEMO_SURVEYS.filter(s => s.status === 'pending_review' && s.submittedBy === 'current_user')));
            }
        }
        
        if (typeof DEMO_TASKS !== 'undefined' && DEMO_TASKS.length > 0) {
            const existingTasks = this.getEvaluatorTasks();
            if (forceRefresh || existingTasks.length === 0 || existingTasks.length !== DEMO_TASKS.length) {
                this.saveEvaluatorTasks(DEMO_TASKS);
            }
        }
        
        if (typeof DEMO_FEEDBACKS !== 'undefined' && DEMO_FEEDBACKS.length > 0) {
            const existingFeedbacks = this.getFeedbacks();
            if (forceRefresh || existingFeedbacks.length === 0 || existingFeedbacks.length !== DEMO_FEEDBACKS.length) {
                this.saveFeedbacks(DEMO_FEEDBACKS);
            }
        }
    },
    
    // ============================================
    // 状态变更操作
    // ============================================
    
    // 提交审核（创建待审核）
    submitForReview(surveyData) {
        surveyData.status = 'pending_review';
        surveyData.submittedAt = new Date().toISOString();
        return this.addSurvey(surveyData);
    },
    
    // 审核通过
    approveSurvey(id) {
        return this.updateSurvey(id, {
            status: 'active',
            approvedAt: new Date().toISOString()
        });
    },
    
    // 驳回
    rejectSurvey(id, reason) {
        return this.updateSurvey(id, {
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectReason: reason
        });
    },
    
    // 完成调研
    completeSurvey(id) {
        return this.updateSurvey(id, {
            status: 'completed',
            completedAt: new Date().toISOString()
        });
    },
    
    // 更新进度
    updateProgress(id, submittedCount, totalCount) {
        const progress = Math.round((submittedCount / totalCount) * 100);
        return this.updateSurvey(id, {
            submittedCount,
            progress
        });
    }
};

// 导出供全局使用
if (typeof window !== 'undefined') {
    window.DataStore = DataStore;
}

// Node 环境导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataStore;
}
