import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
// 注册服务条款页面。
export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="terms-root">
            <div className="terms-container">
                <div className="terms-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                        返回
                    </button>
                    <h1>学生信息管理系统 - 注册服务条款</h1>
                </div>

                <div className="terms-content">
                    <section>
                        <h2>重要提示</h2>
                        <p>在注册使用本软件服务前，请仔细阅读以下条款。一旦完成注册，即表示您已阅读、理解并同意接受本条款的所有内容。</p>
                    </section>

                    <section>
                        <h2>1. 服务性质</h2>
                        <p>1.1 本软件为开源软件，基于社区共享精神开发维护。</p>
                        <p>1.2 本服务由个人开发者（学生）利用课余时间独立维护，不隶属于任何商业组织或教育机构。</p>
                    </section>

                    <section>
                        <h2>2. 数据存留声明</h2>
                        <p>2.1 不保证数据持久性：由于服务器资源有限且可能发生不可预见的故障，我们无法绝对保证您的数据能够永久存留。</p>
                        <p>2.2 数据丢失风险：您理解并同意，服务器维护、迁移或失效可能导致数据丢失，且我们不承担因此造成的任何数据损失责任。</p>
                        <p>2.3 自行备份建议：强烈建议您定期对重要数据进行本地备份，以防意外丢失。</p>
                    </section>

                    <section>
                        <h2>3. 服务可用性</h2>
                        <p>3.1 服务可能中断：由于学业压力、服务器维护或资源限制，服务可能会不定期中断或暂停。</p>
                        <p>3.2 服务终止可能：开发者保留因个人原因（如毕业、学业繁忙等）随时终止服务的权利，届时将尽力提前通知用户。</p>
                    </section>

                    <section>
                        <h2>4. 用户义务</h2>
                        <p>4.1 合规使用：您承诺遵守所在地法律法规，不将本服务用于任何违法或侵权用途。</p>
                        <p>4.2 账号安全：您需自行负责账号和密码的保密，并对使用该账号的所有行为承担责任。</p>
                        <p>4.3 合理使用：请勿对服务进行恶意攻击或过度占用资源，影响其他用户正常使用。</p>
                    </section>

                    <section>
                        <h2>5. 免责声明</h2>
                        <p>5.1 “按原样”提供：本服务按“现状”和“可用的”基础提供，不提供任何明示或暗示的担保。</p>
                        <p>5.2 责任限制：在任何情况下，开发者均不对因使用或无法使用本服务而产生的任何间接、附带、特殊或后果性损害承担责任。</p>
                    </section>

                    <section>
                        <h2>6. 开源许可</h2>
                        <p>6.1 本软件基于开源许可证发布，您可以在项目仓库中查看具体的开源协议条款。</p>
                        <p>6.2 欢迎参与项目贡献，但请遵守项目的贡献指南和代码规范。</p>
                    </section>

                    <section>
                        <h2>7. 联系方式</h2>
                        <p>7.1 如果您对本服务有任何问题或建议，可以通过以下方式联系：</p>
                        <ul>
                            <li>邮箱：<a href="mailto:3148338348@qq.com">3148338348@qq.com</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
