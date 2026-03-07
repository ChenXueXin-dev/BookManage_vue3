<template>
  <div class="about-container">
    <div class="page-header">
      <h1 class="page-title">关于我们</h1>
      <div class="divider"></div>
    </div>

    <div class="about-content">
      <section class="about-section">
        <h2>图书室借阅管理系统简介</h2>
        <p>图书室借阅管理系统是一个专为图书爱好者设计的平台，旨在帮助用户发现符合他们兴趣和阅读偏好的图书。我们通过先进的推荐算法和用户行为分析，为每位用户提供个性化的阅读建议。</p>
      </section>

      <section class="about-section">
        <h2>我们的使命</h2>
        <p>我们致力于连接读者与知识，让每一本好书都能找到它的读者。通过促进阅读和知识分享，我们希望能够丰富用户的精神世界，让阅读成为一种更加便捷和愉悦的体验。</p>
      </section>

      <section class="about-section">
        <h2>核心功能</h2>
        <div class="features-grid">
          <div class="feature-item">
            <el-icon class="feature-icon">
              <Search />
            </el-icon>
            <h3>图书浏览</h3>
            <p>提供丰富的图书资源，涵盖各种类别和主题，便于用户查找和发现感兴趣的书籍。</p>
          </div>

          <div class="feature-item">
            <el-icon class="feature-icon">
              <Notebook />
            </el-icon>
            <h3>在线借阅</h3>
            <p>用户可以在线借阅图书，并管理自己的借阅记录，享受便捷的图书服务。</p>
          </div>

          <div class="feature-item">
            <el-icon class="feature-icon">
              <Star />
            </el-icon>
            <h3>收藏管理</h3>
            <p>用户可以收藏自己喜欢的图书，建立个人书单，方便后续阅读和管理。</p>
          </div>

          <div class="feature-item">
            <el-icon class="feature-icon">
              <ChatDotRound />
            </el-icon>
            <h3>评论交流</h3>
            <p>提供图书评论和评分功能，促进用户之间的交流和对图书的深入讨论。</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>联系我们</h2>
        <p>如果您有任何问题、建议或合作意向，欢迎随时与我们联系。</p>
        <div class="contact-info">
          <div class="contact-item">
            <strong>邮箱：</strong> contact@bookrec.example.com
          </div>
          <div class="contact-item">
            <strong>地址：</strong> 中国某省某市某区某街道123号
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { Search, Notebook, Star, ChatDotRound } from '@element-plus/icons-vue'
</script>

<style lang="scss" scoped>
.about-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 30px;
  text-align: center;

  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 15px;
  }

  .divider {
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #409EFF, #7262fd);
    margin: 0 auto;
    border-radius: 3px;
  }
}

.about-section {
  margin-bottom: 40px;

  h2 {
    font-size: 22px;
    color: #303133;
    margin-bottom: 15px;
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 5px;
      bottom: 5px;
      width: 4px;
      background-color: #409EFF;
      border-radius: 2px;
    }
  }

  p {
    font-size: 16px;
    line-height: 1.7;
    color: #606266;
    margin-bottom: 15px;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;

  .feature-item {
    padding: 20px;
    border-radius: 8px;
    background-color: #f5f7fa;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 30px;
      color: #409EFF;
      margin-bottom: 15px;
    }

    h3 {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 10px;
    }

    p {
      font-size: 14px;
      color: #606266;
      line-height: 1.6;
    }
  }
}

.contact-info {
  margin-top: 15px;

  .contact-item {
    margin-bottom: 10px;
    font-size: 15px;
    color: #606266;
  }
}

@media (max-width: 768px) {
  .about-container {
    padding: 20px 15px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .page-header .page-title {
    font-size: 24px;
  }

  .about-section h2 {
    font-size: 20px;
  }
}
</style>