import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// 简约风格服务条款页面
export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="terms-root">
            <div className="terms-container">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} />
                    返回
                </button>
                
                <h1 className="terms-title">服务条款</h1>

                <div className="terms-content">
                    <section>
                        <h2>重要提示</h2>
                        <p>注册即表示您已阅读并同意本条款的所有内容。</p>
                    </section>

                    <section>
                        <h2>1. 服务性质</h2>
                        <p>本软件为开源项目，由个人开发者维护，不隶属于任何商业组织。</p>
                    </section>

                    <section>
                        <h2>2. 数据声明</h2>
                        <p>我们不保证数据的永久存留，建议您定期备份重要数据。</p>
                    </section>

                    <section>
                        <h2>3. 服务可用性</h2>
                        <p>服务可能因维护或资源限制而中断，开发者保留随时终止服务的权利。</p>
                    </section>

                    <section>
                        <h2>4. 用户义务</h2>
                        <p>您需遵守法律法规，保护账号安全，合理使用服务。</p>
                    </section>

                    <section>
                        <h2>5. 免责声明</h2>
                        <p>本服务按"现状"提供，不提供任何担保，开发者不对使用本服务产生的损害承担责任。</p>
                    </section>

                    <section>
                        <h2>6. 联系方式</h2>
                        <p>邮箱：<a href="mailto:3148338348@qq.com" className="terms-link">3148338348@qq.com</a></p>
                    </section>
                </div>
            </div>
        </div>
    );
}
