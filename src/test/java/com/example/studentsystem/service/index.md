# service测试
* StudentServiceImpl 的单元测试:
* 只测试业务分支与与仓库交互，不连接真实数据库。
* 通过 Mockito 模拟 StudentRepository 的行为，验证 Service 里 create、list 等方法的逻辑。
* 关联源码：
*   StudentServiceImpl.create(): 先用 repo.findByStudentNo 检查重复，再保存。
*   StudentServiceImpl.list(): 优先按 studentNo 精确，再按 name 模糊，否则 repo.findAll。
*   StudentServiceImpl.update()/delete() 未在本类中测试（可扩展）。
* DTO 与实体：
*   StudentRequestDto -> 输入数据（模拟客户端传入）。
*   Student -> JPA 实体，持久层对象。
*   StudentResponseDto -> 输出数据（由 StudentMapper.toDto 转换）。