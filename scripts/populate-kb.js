"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("../src/lib/supabase/client");
var ADMIN_USER_ID = 'system'; // We'll use this as the author for seeded articles
var categories = [
    {
        name: 'Getting Started',
        description: 'Basic information about using the platform',
        parent_id: null,
        display_order: 1
    },
    {
        name: 'Account Management',
        description: 'Managing your account settings and preferences',
        parent_id: null,
        display_order: 2
    },
    {
        name: 'Billing & Subscriptions',
        description: 'Information about billing, payments, and subscription plans',
        parent_id: null,
        display_order: 3
    },
    {
        name: 'Security',
        description: 'Security features and best practices',
        parent_id: null,
        display_order: 4
    }
];
var articles = {
    'Getting Started': [
        {
            title: 'How to Create Your First Project',
            content: 'Learn how to create and set up your first project in our platform. Follow these simple steps:\n\n1. Click the "New Project" button\n2. Enter your project name and description\n3. Choose your project settings\n4. Invite team members\n5. Start collaborating!',
            category_id: '', // Will be filled with actual category ID
            author_id: ADMIN_USER_ID
        },
        {
            title: 'Understanding the Dashboard',
            content: 'Get familiar with our intuitive dashboard interface. Learn about key metrics, navigation, and customization options to make the most of your experience.',
            category_id: '',
            author_id: ADMIN_USER_ID
        }
    ],
    'Account Management': [
        {
            title: 'How to Update Your Profile',
            content: 'Keep your profile information up to date by following these steps:\n\n1. Go to Settings\n2. Click on Profile\n3. Update your information\n4. Save changes',
            category_id: '',
            author_id: ADMIN_USER_ID
        },
        {
            title: 'Managing Team Members',
            content: 'Learn how to add, remove, and manage team members in your organization. Understand different roles and permissions available.',
            category_id: '',
            author_id: ADMIN_USER_ID
        }
    ],
    'Billing & Subscriptions': [
        {
            title: 'Understanding Your Bill',
            content: 'Learn how to read and understand your monthly bill. Find information about charges, credits, and usage-based pricing.',
            category_id: '',
            author_id: ADMIN_USER_ID
        },
        {
            title: 'Changing Subscription Plans',
            content: 'Follow this guide to upgrade or downgrade your subscription plan. Learn about different features available in each plan.',
            category_id: '',
            author_id: ADMIN_USER_ID
        }
    ],
    'Security': [
        {
            title: 'Two-Factor Authentication Setup',
            content: 'Enhance your account security by enabling two-factor authentication (2FA). Follow our step-by-step guide to set up 2FA using your preferred method.',
            category_id: '',
            author_id: ADMIN_USER_ID
        },
        {
            title: 'Best Practices for Password Security',
            content: 'Learn about password best practices including:\n\n- Creating strong passwords\n- Using password managers\n- Regular password updates\n- Avoiding common security mistakes',
            category_id: '',
            author_id: ADMIN_USER_ID
        }
    ]
};
// Common/FAQ articles without a specific category
var commonArticles = [
    {
        title: 'What is the SLA for support tickets?',
        content: 'Our Service Level Agreement (SLA) for support tickets varies by priority:\n\n- Critical: 1 hour response time\n- High: 4 hours response time\n- Medium: 8 hours response time\n- Low: 24 hours response time',
        category_id: '',
        author_id: ADMIN_USER_ID
    },
    {
        title: 'How do I contact support?',
        content: 'There are several ways to contact our support team:\n\n1. Submit a ticket through the help desk\n2. Email support@example.com\n3. Use the in-app chat during business hours\n4. Call our support line for urgent issues',
        category_id: '',
        author_id: ADMIN_USER_ID
    }
];
function populateKnowledgeBase() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, categories_1, category, _a, categoryData, categoryError, categoryArticles, _b, categoryArticles_1, article, articleError, _c, commonArticles_1, article, articleError, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 12, , 13]);
                    console.log('Starting knowledge base population...');
                    _i = 0, categories_1 = categories;
                    _d.label = 1;
                case 1:
                    if (!(_i < categories_1.length)) return [3 /*break*/, 7];
                    category = categories_1[_i];
                    return [4 /*yield*/, client_1.supabase
                            .from('kb_categories')
                            .insert(category)
                            .select()
                            .single()];
                case 2:
                    _a = _d.sent(), categoryData = _a.data, categoryError = _a.error;
                    if (categoryError) {
                        throw new Error("Failed to insert category ".concat(category.name, ": ").concat(categoryError.message));
                    }
                    console.log("Created category: ".concat(category.name));
                    categoryArticles = articles[category.name];
                    if (!categoryArticles) return [3 /*break*/, 6];
                    _b = 0, categoryArticles_1 = categoryArticles;
                    _d.label = 3;
                case 3:
                    if (!(_b < categoryArticles_1.length)) return [3 /*break*/, 6];
                    article = categoryArticles_1[_b];
                    article.category_id = categoryData.id;
                    return [4 /*yield*/, client_1.supabase
                            .from('kb_articles')
                            .insert(article)];
                case 4:
                    articleError = (_d.sent()).error;
                    if (articleError) {
                        throw new Error("Failed to insert article ".concat(article.title, ": ").concat(articleError.message));
                    }
                    console.log("Created article: ".concat(article.title));
                    _d.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    _c = 0, commonArticles_1 = commonArticles;
                    _d.label = 8;
                case 8:
                    if (!(_c < commonArticles_1.length)) return [3 /*break*/, 11];
                    article = commonArticles_1[_c];
                    return [4 /*yield*/, client_1.supabase
                            .from('kb_articles')
                            .insert(article)];
                case 9:
                    articleError = (_d.sent()).error;
                    if (articleError) {
                        throw new Error("Failed to insert common article ".concat(article.title, ": ").concat(articleError.message));
                    }
                    console.log("Created common article: ".concat(article.title));
                    _d.label = 10;
                case 10:
                    _c++;
                    return [3 /*break*/, 8];
                case 11:
                    console.log('Knowledge base population completed successfully!');
                    return [3 /*break*/, 13];
                case 12:
                    error_1 = _d.sent();
                    console.error('Failed to populate knowledge base:', error_1);
                    throw error_1;
                case 13: return [2 /*return*/];
            }
        });
    });
}
// Run the script
populateKnowledgeBase();
