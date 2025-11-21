# 日志：2025-11-3
已经完成了软件的安装，配置好了项目：“学生管理系统”
- 技术栈：Java 17, Spring Boot, Spring Data JPA, MySQL, Maven,Spring Security + JWT
# 项目目录（概览）
```
student-system/
├─ .gitignore  # Git 忽略文件配置
├─ pom.xml    # Maven 项目配置文件,依赖的管理
├─ mvnw
├─ src/
│  ├─ main/
│  │  ├─ java/
│  │  │  └─ com/example/studentsystem/
│  │  │     ├─ StudentSystemApplication.java       # 启动类
│  │  │     ├─ controller/
│  │  │     │  └─ StudentController.java           # REST 控制器
│  │  │     ├─ dto/
│  │  │     │  ├─ StudentRequestDto.java          # 创建/更新学生请求 DTO
│  │  │     │  └─ StudentResponseDto.java         # 学生响应 DTO
│  │  │     ├─ exception/
│  │  │     │  ├─ GlobalExceptionHandler.java      # 全局异常处理器
│  │  │     │  ├─ ErrorResponse.java               # 统一错误响应模型
│  │  │     │  └─ DuplicateResourceException.java    # 自定义异常类
│  │  │     ├─ mapper/
│  │  │     │  └─ StudentMapper.java               # DTO 与实体转换器
│  │  │     ├─ model/
│  │  │     │  └─ Student.java                     # JPA 实体
│  │  │     │  └─ Role.java                        # 
│  │  │     │  └─ User.java                        #
│  │  │     └─ repository/
│  │  │     │  └─ StudentRepository.java           # JpaRepository 接口
│  │  │     │  └─ UserRepository.java              #
│  │  │     └─ security/
│  │  │     │  └─ jwt/                     # JWT 相关类
│  │  │     │  │    └─ JwtAuthenticationFilter.java   # JWT 认证过滤器
│  │  │     │  │    └─ jwtService.java               #   
│  │  │     │  └─ SecurityConfig.java                 #
│  │  │     │  └─ SecurityBeansConfig.java           #      
│  │  │     └─ service/
│  │  │     │  ├─ StudentService.java               # 学生服务接口
│  │  │     │   └─ StudentServiceImpl.java           # 学生服务实现
│  │  │     │   └─ UserService.java                  # 
│  │  │     └─ web/
│  │  │     │  └─ dto/
│  │  │     │  │    └─ AuthRequest.java           # 
│  │  │     │  │    └─ AuthResponse.java         # 
│  │  │     │  └─ AuthController.java         # 处理网页请求的控制器
│  │  └─ resources/
│  │     ├─ application.properties                 # 生产环境的配置文件
|  |     ├─ application-dev.properties             # 开发环境的配置文件配置
│  │     ├─ static/                                # 静态资源
│  │     └─ index.html/                            # 首页 HTML 文件
│  └─ test/
│     ├─ java/
│     │  └─ com/example/studentsystem/
│     │     └─ StudentControllerTest.java  # Controller测试类
│     │     └─ StudentRepositoryTest.java  # Repository测试类
│     │     └─ StudentServiceTest.java  # Service测试类
│     │     └─ StudentSystemApplicationTests.java  # 测试主类
│     └─ resources/
│         └─ application.properties                 # 测试环境的配置文件
├─ target/                                 # Maven 构建输出目录
│  ├─ surrfire-reports                     # 测试log报告日志
│  ├─ student-system-0.01-SNAPSHOT.jar      # 编译后的可执行 JAR 包
└─ index.md  # 项目说明文档

```


