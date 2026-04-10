/* ============================================
   360调研系统 - 公共脚本
   ============================================ */

// ============================================
// 1. 工具函数 (Utils)
// ============================================
const Utils = {
    /**
     * 日期格式化
     * @param {Date|string} date - 日期对象或字符串
     * @param {string} format - 格式模板 (YYYY-MM-DD HH:mm)
     * @returns {string}
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    /**
     * 获取相对时间描述
     * @param {Date|string} date
     * @returns {string}
     */
    relativeTime(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = now - target;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 30) return `${days}天前`;
        return this.formatDate(date);
    },

    /**
     * 防抖函数
     * @param {Function} fn
     * @param {number} delay
     * @returns {Function}
     */
    debounce(fn, delay = 300) {
        let timer = null;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * 节流函数
     * @param {Function} fn
     * @param {number} limit
     * @returns {Function}
     */
    throttle(fn, limit = 300) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * 复制到剪贴板
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const result = document.execCommand('copy');
            document.body.removeChild(textarea);
            return result;
        }
    },

    /**
     * 生成唯一ID
     * @param {string} prefix
     * @returns {string}
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * 深拷贝
     * @param {any} obj
     * @returns {any}
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * 本地存储封装（带异常处理）
     */
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('Storage get error:', e);
                return defaultValue;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.warn('Storage set error:', e);
                return false;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.warn('Storage remove error:', e);
                return false;
            }
        }
    },

    /**
     * URL参数解析
     * @param {string} url
     * @returns {Object}
     */
    parseUrlParams(url = window.location.search) {
        const params = {};
        const searchParams = new URLSearchParams(url);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },

    /**
     * 判断是否为移动端
     * @returns {boolean}
     */
    isMobile() {
        return window.innerWidth < 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * 安全获取 DOM 元素
     * @param {string} id - 元素ID
     * @returns {HTMLElement|null}
     */
    getEl(id) {
        return document.getElementById(id);
    },

    /**
     * 安全设置元素内容
     * @param {string|HTMLElement} el - 元素或ID
     * @param {string} content - 内容
     * @param {string} type - 内容类型 (html/text)
     */
    setContent(el, content, type = 'html') {
        const element = typeof el === 'string' ? this.getEl(el) : el;
        if (!element) return false;
        
        if (type === 'html') {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
        return true;
    },

    /**
     * 安全设置元素样式
     * @param {string|HTMLElement} el - 元素或ID
     * @param {Object} styles - 样式对象
     */
    setStyle(el, styles) {
        const element = typeof el === 'string' ? this.getEl(el) : el;
        if (!element) return false;
        
        Object.assign(element.style, styles);
        return true;
    },

    /**
     * 安全添加事件监听
     * @param {string|HTMLElement} el - 元素或ID
     * @param {string} event - 事件名
     * @param {Function} handler - 处理函数
     */
    on(el, event, handler) {
        const element = typeof el === 'string' ? this.getEl(el) : el;
        if (!element) return false;
        
        element.addEventListener(event, handler);
        return true;
    }
};

// ============================================
// 2. UI 组件 (UI)
// ============================================
const UI = {
    /**
     * 显示 Toast 提示
     * @param {string} message
     * @param {string} type - success/error/warning/info
     * @param {number} duration
     */
    toast(message, type = 'info', duration = 3000) {
        // 获取或创建容器
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // 创建 Toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        
        toast.innerHTML = `
            <i class="bi ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);

        // 自动移除
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * 显示确认对话框
     * @param {string} title
     * @param {string} message
     * @param {Function} onConfirm
     * @param {Function} onCancel
     */
    confirm(title, message, onConfirm, onCancel) {
        // 创建遮罩
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h5 class="m-0">${title}</h5>
                    <button class="btn-icon" onclick="this.closest('.modal-overlay').remove()">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="m-0 text-muted">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" data-cancel>取消</button>
                    <button class="btn btn-danger" data-confirm>确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);

        // 绑定事件
        overlay.querySelector('[data-cancel]').addEventListener('click', () => {
            overlay.remove();
            onCancel && onCancel();
        });
        
        overlay.querySelector('[data-confirm]').addEventListener('click', () => {
            overlay.remove();
            onConfirm && onConfirm();
        });

        // 点击遮罩关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                onCancel && onCancel();
            }
        });
    },

    /**
     * 显示加载中
     * @param {string} message
     * @returns {Object} { close: Function }
     */
    loading(message = '加载中...') {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.background = 'rgba(255,255,255,0.8)';
        overlay.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);

        return {
            close: () => overlay.remove()
        };
    },

    /**
     * 初始化侧边栏导航激活状态
     * @param {string} currentPage
     */
    initSidebar(currentPage) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (href && href.includes(currentPage)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    /**
     * 渲染分页
     * @param {Object} options
     * @returns {string} HTML
     */
    renderPagination({ current, total, onChange }) {
        if (total <= 1) return '';

        let html = '<div class="pagination">';
        
        // 上一页
        html += `<button class="page-item ${current === 1 ? 'disabled' : ''}" data-page="${current - 1}">
            <i class="bi bi-chevron-left"></i>
        </button>`;

        // 页码
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
                html += `<button class="page-item ${i === current ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === current - 2 || i === current + 2) {
                html += `<span class="page-item disabled">...</span>`;
            }
        }

        // 下一页
        html += `<button class="page-item ${current === total ? 'disabled' : ''}" data-page="${current + 1}">
            <i class="bi bi-chevron-right"></i>
        </button>`;
        
        html += '</div>';

        // 绑定事件
        setTimeout(() => {
            document.querySelectorAll('.page-item[data-page]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const page = parseInt(btn.dataset.page);
                    if (page >= 1 && page <= total && page !== current) {
                        onChange(page);
                    }
                });
            });
        }, 0);

        return html;
    },

    /**
     * 渲染空状态
     * @param {Object} options
     * @returns {string} HTML
     */
    renderEmptyState({ icon = '📭', title = '暂无数据', description = '', action = null }) {
        return `
            <div class="empty-state">
                <div class="empty-icon">${icon}</div>
                <h3 class="empty-title">${title}</h3>
                ${description ? `<p class="empty-desc">${description}</p>` : ''}
                ${action ? `<button class="btn btn-primary" onclick="${action.onClick}">${action.text}</button>` : ''}
            </div>
        `;
    }
};

// ============================================
// 3. 数据 API 封装
// ============================================
const API = {
    /**
     * 获取所有调研
     * @returns {Array}
     */
    getSurveys() {
        return Utils.storage.get('allSurveys', []);
    },

    /**
     * 获取单个调研
     * @param {string} id
     * @returns {Object|null}
     */
    getSurvey(id) {
        return this.getSurveys().find(s => s.id === id) || null;
    },

    /**
     * 保存所有调研
     * @param {Array} surveys
     */
    saveSurveys(surveys) {
        Utils.storage.set('allSurveys', surveys);
    },

    /**
     * 添加调研
     * @param {Object} survey
     * @returns {Object}
     */
    addSurvey(survey) {
        const surveys = this.getSurveys();
        survey.id = survey.id || Utils.generateId('survey');
        survey.createdAt = new Date().toISOString();
        surveys.push(survey);
        this.saveSurveys(surveys);
        return survey;
    },

    /**
     * 更新调研
     * @param {string} id
     * @param {Object} updates
     * @returns {Object|null}
     */
    updateSurvey(id, updates) {
        const surveys = this.getSurveys();
        const index = surveys.findIndex(s => s.id === id);
        if (index !== -1) {
            surveys[index] = { ...surveys[index], ...updates };
            this.saveSurveys(surveys);
            return surveys[index];
        }
        return null;
    },

    /**
     * 删除调研
     * @param {string} id
     * @returns {boolean}
     */
    deleteSurvey(id) {
        const surveys = this.getSurveys();
        const filtered = surveys.filter(s => s.id !== id);
        this.saveSurveys(filtered);
        return filtered.length < surveys.length;
    },

    /**
     * 按状态获取调研
     * @param {string} status
     * @returns {Array}
     */
    getSurveysByStatus(status) {
        return this.getSurveys().filter(s => s.status === status);
    },

    /**
     * 获取统计信息
     * @returns {Object}
     */
    getStats() {
        const surveys = this.getSurveys();
        return {
            total: surveys.length,
            pending: surveys.filter(s => s.status === 'pending_review').length,
            active: surveys.filter(s => s.status === 'active').length,
            completed: surveys.filter(s => s.status === 'completed').length,
            rejected: surveys.filter(s => s.status === 'rejected').length
        };
    },

    /**
     * 获取评估任务
     * @returns {Array}
     */
    getTasks() {
        return Utils.storage.get('evaluatorTasks', []);
    },

    /**
     * 保存评估任务
     * @param {Array} tasks
     */
    saveTasks(tasks) {
        Utils.storage.set('evaluatorTasks', tasks);
    }
};

// ============================================
// 4. 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 自动初始化侧边栏
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop().replace('.html', '');
    
    if (document.querySelector('.nav-item')) {
        UI.initSidebar(currentPage);
    }

    // 初始化 Demo 数据
    if (typeof initDemoData === 'function') {
        initDemoData();
    }

    console.log('[Common] 公共脚本已加载');
});

// 导出到全局（用于非模块环境）
if (typeof window !== 'undefined') {
    window.Utils = Utils;
    window.UI = UI;
    window.API = API;
}


// ============================================
// 5. 统一调研列表渲染 (从审核中心同步)
// ============================================

/**
 * 关系类型定义 - 支持自定义名称
 */
const RELATION_TYPES = {
    up: { key: 'up', label: '上级', icon: '↑', color: '#1e40af', description: '直属领导或更高层级管理者' },
    peer: { key: 'peer', label: '平级', icon: '↔', color: '#065f46', description: '同部门或跨部门同级别同事' },
    down: { key: 'down', label: '下级', icon: '↓', color: '#9a3412', description: '直接下属或团队成员' },
    cross_dept: { key: 'cross_dept', label: '横向部门', icon: '⛔', color: '#7c3aed', description: '其他部门高层或跨部门协作者' },
    hr_partner: { key: 'hr_partner', label: 'HRBP', icon: '♥', color: '#db2777', description: 'HR业务伙伴' },
    project_lead: { key: 'project_lead', label: '项目负责人', icon: '◆', color: '#0369a1', description: '核心项目负责人' },
    external: { key: 'external', label: '外部客户', icon: '☆', color: '#666666', description: '外部客户或合作方' }
};

/**
 * 场景配置 - 各场景的关系类型定义
 */
const SCENE_RELATIONS = {
    promotion: [
        { type: 'up', label: '直属Leader' },
        { type: 'cross_dept', label: '跨部门高层' },
        { type: 'peer', label: '同仁互评' },
        { type: 'hr_partner', label: 'HRBP评价' }
    ],
    probation: [
        { type: 'up', label: '直属Leader' },
        { type: 'peer', label: '师傅/平级' },
        { type: 'hr_partner', label: 'HRBP评价' }
    ],
    newleader: [
        { type: 'up', label: '上级VP' },
        { type: 'cross_dept', label: '协作部门负责人' },
        { type: 'peer', label: '其他Leader' },
        { type: 'down', label: '团队成员反馈' },
        { type: 'hr_partner', label: 'HRBP评价' }
    ],
    performance: [
        { type: 'up', label: '直属Leader' },
        { type: 'peer', label: '同仁互评' },
        { type: 'project_lead', label: '项目负责人' }
    ]
};

/**
 * 场景维度定义
 */
const SCENE_DIMENSIONS = {
    promotion: ['专业能力', '领导力', '文化契合', '发展潜力', '跨团队协作'],
    probation: ['岗位胜任', '团队协作', '学习成长', '文化融入', '工作态度'],
    newleader: ['管理能力', '团队反馈', '业务理解', '沟通协作', '决策能力'],
    performance: ['目标达成', '协作能力', '价值观践行', '创新能力', '执行效率']
};

/**
 * 获取场景的关系类型配置
 * @param {string} scene - 场景key
 * @returns {Array} 关系类型配置数组
 */
function getEvaluatorRelations(scene) {
    return SCENE_RELATIONS[scene] || [
        { type: 'up', label: '上级' },
        { type: 'peer', label: '平级' },
        { type: 'down', label: '下级' }
    ];
}

/**
 * 获取场景维度
 * @param {string} scene - 场景key
 * @returns {Array} 维度数组
 */
function getSceneDimensions(scene) {
    return SCENE_DIMENSIONS[scene] || [];
}

/**
 * 获取场景显示信息
 * @param {string} scene - 场景key
 * @returns {Object} 场景名称和样式类
 */
function getSceneInfo(scene) {
    const sceneMap = {
        promotion: { name: '晋升评估', class: 'scene-promotion' },
        probation: { name: '转正评估', class: 'scene-probation' },
        newleader: { name: '新Leader考察', class: 'scene-newleader' },
        performance: { name: '绩效考核', class: 'scene-performance' }
    };
    return sceneMap[scene] || { name: '其他', class: '' };
}

/**
 * 渲染评估人标签（紧凑版）
 * @param {Array} evaluators - 评估人数组
 * @returns {string} HTML字符串
 */
function renderEvaluatorTagsCompact(evaluators) {
    if (!evaluators || evaluators.length === 0) {
        return '<span style="color: var(--gray-400); font-size: 0.625rem;">-</span>';
    }
    
    return evaluators.map(e => {
        const title = e.title || e.role || '';
        const level = e.level || '';
        const empId = e.empId || '';
        const dept = e.dept || '未知部门';
        
        // 构建tooltip内容
        const tooltipContent = [
            e.name,
            title ? `岗位：${title}` : '',
            level ? `职级：${level}` : '',
            dept ? `部门：${dept}` : '',
            empId ? `工号：${empId}` : ''
        ].filter(Boolean).join(' | ');
        
        return `
            <span class="evaluator-tag-inline" 
                  title="${tooltipContent}"
                  onmouseenter="showEvaluatorTooltipDetail(this, '${e.name}', '${title}', '${level}', '${dept}', '${empId}')"
                  onmouseleave="hideEvaluatorTooltip()">
                <span class="evaluator-avatar-inline">${e.name.charAt(0)}</span>
                <span class="evaluator-info">
                    <span class="evaluator-name">${e.name}</span>
                    ${title ? `<span class="evaluator-title">${title}</span>` : ''}
                </span>
            </span>
        `;
    }).join('');
}

/**
 * 渲染关系矩阵（紧凑版）
 * @param {Array} subjects - 被评估人数组
 * @param {string} scene - 场景key
 * @returns {string} HTML字符串
 */
function renderRelationsCompact(subjects, scene) {
    if (!subjects || subjects.length === 0) {
        return '<div style="color: var(--gray-400); font-size: 0.75rem; padding: 0.5rem 0;">暂无被评估人信息</div>';
    }
    
    const relations = getEvaluatorRelations(scene);
    
    return subjects.map(subject => {
        // 动态渲染关系列
        const relationColumns = relations.map(rel => {
            const relationType = rel.type;
            const label = rel.label || RELATION_TYPES[relationType]?.label || relationType;
            const typeConfig = RELATION_TYPES[relationType] || RELATION_TYPES.peer;
            const count = subject.evaluators?.[relationType]?.length || 0;
            const color = typeConfig.color || '#666';
            
            return `
                <div class="matrix-col-inline">
                    <div class="matrix-col-header">
                        <span style="color: ${color}; font-size: 0.75rem; margin-right: 0.25rem;">${typeConfig.icon}</span>
                        <span style="color: ${color}; font-weight: 600;">${label}</span>
                        <span style="color: var(--gray-400); font-size: 0.625rem;">(${count})</span>
                    </div>
                    <div class="evaluator-tags-inline">
                        ${renderEvaluatorTagsCompact(subject.evaluators?.[relationType] || [])}
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="subject-relation-row">
                <div class="subject-info-compact">
                    <div class="mini-avatar">${subject.name.charAt(0)}</div>
                    <div>
                        <div class="subject-name-compact">${subject.name}</div>
                        <div class="subject-meta-compact">${subject.dept || '未知部门'} · ${subject.level || '未知职级'}</div>
                    </div>
                </div>
                <div class="evaluator-matrix-inline" style="grid-template-columns: repeat(${relations.length}, 1fr);">
                    ${relationColumns}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 渲染分类标签
 * @param {Array} dimensions - 维度数组
 * @returns {string} HTML字符串
 */
function renderCategoryTags(dimensions) {
    if (!dimensions || dimensions.length === 0) return '';
    return dimensions.map(d => `<span class="category-tag">${d}</span>`).join('');
}

/**
 * 显示评估人详细Tooltip
 * @param {HTMLElement} element - 触发元素
 * @param {string} name - 姓名
 * @param {string} title - 岗位
 * @param {string} level - 职级
 * @param {string} dept - 部门
 * @param {string} empId - 工号
 */
function showEvaluatorTooltipDetail(element, name, title, level, dept, empId) {
    hideEvaluatorTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.id = 'evaluator-tooltip';
    tooltip.className = 'evaluator-tooltip evaluator-tooltip-detail';
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <div class="tooltip-avatar">${name.charAt(0)}</div>
            <div class="tooltip-header-info">
                <div class="tooltip-name">${name}</div>
                ${title ? `<div class="tooltip-title">${title}</div>` : ''}
            </div>
        </div>
        <div class="tooltip-body">
            ${level ? `<div class="tooltip-row"><span class="tooltip-label">职级：</span><span class="tooltip-value">${level}</span></div>` : ''}
            ${dept ? `<div class="tooltip-row"><span class="tooltip-label">部门：</span><span class="tooltip-value">${dept}</span></div>` : ''}
            ${empId ? `<div class="tooltip-row"><span class="tooltip-label">工号：</span><span class="tooltip-value">${empId}</span></div>` : ''}
        </div>
    `;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // 确保tooltip不会超出屏幕右侧
    let left = rect.left;
    if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = (rect.bottom + 8) + 'px';
}

/**
 * 隐藏评估人Tooltip
 */
function hideEvaluatorTooltip() {
    const tooltip = document.getElementById('evaluator-tooltip');
    if (tooltip) tooltip.remove();
}

/**
 * 渲染完整的调研列表项
 * @param {Object} survey - 调研对象
 * @param {boolean} isSelected - 是否选中
 * @returns {string} HTML字符串
 */
function renderSurveyListItem(survey, isSelected = false) {
    const sceneInfo = getSceneInfo(survey.scene);
    const dimensions = getSceneDimensions(survey.scene);
    const subjectCount = survey.subjects ? survey.subjects.length : 0;
    
    // 动态计算所有关系类型的评估人总数
    const evaluatorCount = survey.subjects ? survey.subjects.reduce((sum, s) => {
        if (!s.evaluators) return sum;
        return sum + Object.values(s.evaluators).reduce((relSum, evalList) => 
            relSum + (evalList?.length || 0), 0);
    }, 0) : 0;
    
    return `
        <div class="survey-item ${isSelected ? 'selected' : ''}" data-id="${survey.id}">
            <div class="survey-content">
                <!-- 左侧：基本信息 -->
                <div class="survey-left">
                    <input type="checkbox" class="survey-checkbox" ${isSelected ? 'checked' : ''}>
                    <div class="survey-info">
                        <div class="survey-title-row">
                            <span class="survey-title">${survey.title || '未命名调研'}</span>
                            <span class="scene-tag ${sceneInfo.class}">${sceneInfo.name}</span>
                        </div>
                        <div class="survey-meta">
                            <span><i class="bi bi-person"></i> ${survey.submittedBy || '未知'}</span>
                            <span><i class="bi bi-clock"></i> ${formatDate(survey.submittedAt)}</span>
                        </div>
                        <div class="template-info">
                            <span class="template-label">模板：</span>
                            <span class="template-name">${sceneInfo.name}</span>
                            <span class="template-label">分类：</span>
                            <div class="category-list">${renderCategoryTags(dimensions)}</div>
                        </div>
                    </div>
                </div>
                
                <!-- 中间：考核关系平铺 -->
                <div class="survey-relations">
                    ${renderRelationsCompact(survey.subjects, survey.scene)}
                </div>
                
                <!-- 右侧：统计 -->
                <div class="survey-right">
                    <div class="stat-badge">
                        <div class="stat-value-small">${subjectCount}</div>
                        <div class="stat-label-small">被评估人</div>
                    </div>
                    <div class="stat-badge">
                        <div class="stat-value-small">${evaluatorCount}</div>
                        <div class="stat-label-small">评估人</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * 格式化日期
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(dateString) {
    if (!dateString) return '未知时间';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
}
