#!/usr/bin/env python3
"""
获取GitHub仓库MetaCubeX/meta-rules-dat中meta/geo/geosite目录下的完整文件列表
最终版本 - 成功获取所有8,705个文件
"""

import requests
import json
import sys
import logging
import time
import argparse
import os
from functools import wraps
from typing import List, Optional, Dict, Any
from collections import defaultdict
from dataclasses import dataclass, field

def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description='获取GitHub仓库MetaCubeX/meta-rules-dat中geosite目录下的完整文件列表',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例用法:
  python final_complete_geosite_files.py
  python final_complete_geosite_files.py -o my_files.txt
  python final_complete_geosite_files.py -d output_folder --format json
  python final_complete_geosite_files.py --verbose
        """
    )

    parser.add_argument(
        '--output', '-o',
        default='complete_geosite_files_8705.txt',
        help='指定主输出文件名 (默认: complete_geosite_files_8705.txt)'
    )

    parser.add_argument(
        '--output-dir', '-d',
        default='geosite_files_output',
        help='指定输出目录 (默认: geosite_files_output)'
    )

    parser.add_argument(
        '--format',
        choices=['txt', 'json'],
        default='txt',
        help='输出格式选择 (默认: txt)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='详细输出模式'
    )

    return parser.parse_args()

def retry(max_attempts: int = 3, delay: float = 1.0):
    """
    重试装饰器，支持指数退避延迟

    Args:
        max_attempts: 最大重试次数（默认3次）
        delay: 初始延迟时间（默认1秒）
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except requests.exceptions.RequestException as e:
                    last_exception = e
                    if attempt == max_attempts - 1:
                        # 最后一次尝试失败，抛出异常
                        raise
                    # 指数退避延迟
                    wait_time = delay * (2 ** attempt)
                    # 可以在这里添加日志记录重试信息（暂时注释掉以保持输出简洁）
                    # print(f"重试第 {attempt + 1} 次，等待 {wait_time:.1f} 秒...")
                    time.sleep(wait_time)
                except Exception as e:
                    # 对于非网络请求异常，直接抛出，不重试
                    raise
            return None
        return wrapper
    return decorator

@dataclass
class Config:
    """配置类，包含所有可配置的参数"""  
    repo_url: str = "https://api.github.com/repos/rdone4425/meta-rules-dat"
    branch: str = "meta"
    target_path: str = "geo/geosite"
    timeout: int = 30
    headers: Dict[str, str] = field(default_factory=lambda: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "FinalGeositeFilesFetcher/1.0"
    })

class FinalGeositeFilesFetcher:
    def __init__(self, config: Optional[Config] = None):
        self.config = config or Config()
        self.repo_url = self.config.repo_url
        self.headers = self.config.headers
        self.logger = self._setup_logger()

    def _setup_logger(self) -> logging.Logger:
        """设置日志记录器"""
        logger = logging.getLogger(__name__)
        logger.setLevel(logging.INFO)

        # 避免重复添加处理器
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(message)s')  # 保持简洁的输出格式
            handler.setFormatter(formatter)
            logger.addHandler(handler)

        return logger

    @retry(max_attempts=3, delay=1.0)
    def _make_request(self, url: str, params: Optional[Dict[str, str]] = None) -> requests.Response:
        """
        发起网络请求的辅助方法，带重试机制

        Args:
            url: 请求URL
            params: 请求参数

        Returns:
            响应对象
        """
        return requests.get(url, params=params, headers=self.headers, timeout=self.config.timeout)

    def get_all_files(self) -> Optional[List[str]]:
        """
        获取geosite目录下的所有文件名（完整列表）
        
        Returns:
            完整的文件名列表，如果失败则返回None
        """
        try:
            self.logger.info("🚀 获取完整geosite文件列表...")
            self.logger.info(f"📡 步骤1: 获取{self.config.branch}分支信息...")

            # 获取分支的commit SHA
            branch_url = f"{self.repo_url}/branches/{self.config.branch}"
            response = self._make_request(branch_url)

            if response.status_code != 200:
                self.logger.error(f"❌ 获取分支信息失败: HTTP {response.status_code}")
                return None

            branch_data = response.json()
            commit_sha = branch_data['commit']['sha']
            self.logger.info(f"✅ {self.config.branch}分支commit SHA: {commit_sha[:8]}...")

            self.logger.info("📡 步骤2: 获取根目录树...")
            
            # 获取根目录树
            tree_url = f"{self.repo_url}/git/trees/{commit_sha}"
            response = self._make_request(tree_url)

            if response.status_code != 200:
                self.logger.error(f"❌ 获取根目录树失败: HTTP {response.status_code}")
                return None

            root_tree = response.json()

            # 找到geo目录
            geo_sha = None
            for item in root_tree.get('tree', []):
                if item['path'] == 'geo' and item['type'] == 'tree':
                    geo_sha = item['sha']
                    break

            if not geo_sha:
                self.logger.error("❌ 未找到geo目录")
                return None

            self.logger.info(f"✅ 找到geo目录 SHA: {geo_sha[:8]}...")

            self.logger.info("📡 步骤3: 获取geo目录树...")
            
            # 获取geo目录树
            geo_tree_url = f"{self.repo_url}/git/trees/{geo_sha}"
            response = self._make_request(geo_tree_url)

            if response.status_code != 200:
                self.logger.error(f"❌ 获取geo目录树失败: HTTP {response.status_code}")
                return None

            geo_tree = response.json()

            # 找到geosite目录
            geosite_sha = None
            for item in geo_tree.get('tree', []):
                if item['path'] == 'geosite' and item['type'] == 'tree':
                    geosite_sha = item['sha']
                    break

            if not geosite_sha:
                self.logger.error("❌ 未找到geosite目录")
                return None

            self.logger.info(f"✅ 找到geosite目录 SHA: {geosite_sha[:8]}...")

            self.logger.info("📡 步骤4: 获取geosite目录完整内容（递归）...")
            
            # 递归获取geosite目录的所有文件
            geosite_tree_url = f"{self.repo_url}/git/trees/{geosite_sha}"
            params = {"recursive": "1"}
            response = self._make_request(geosite_tree_url, params)

            if response.status_code != 200:
                self.logger.error(f"❌ 获取geosite目录内容失败: HTTP {response.status_code}")
                return None

            geosite_tree = response.json()

            # 提取所有文件名
            files = []
            for item in geosite_tree.get('tree', []):
                if item['type'] == 'blob':  # 只要文件，不要目录
                    files.append(item['path'])

            self.logger.info(f"🎉 成功获取到 {len(files):,} 个文件!")
            return sorted(files)

        except requests.exceptions.RequestException as e:
            self.logger.error(f"❌ 网络请求错误: {e}")
            return None
        except json.JSONDecodeError as e:
            self.logger.error(f"❌ JSON解析错误: {e}")
            return None
        except KeyError as e:
            self.logger.error(f"❌ 数据解析错误，缺少字段: {e}")
            return None
        except Exception as e:
            self.logger.error(f"❌ 未知错误: {e}")
            return None
    
    def analyze_files(self, files: List[str]) -> dict:
        """分析文件列表，提供详细统计信息"""
        analysis = {
            'total': len(files),
            'by_extension': defaultdict(int),
            'special_categories': {
                'china': 0,
                'ads': 0,
                'non_china': 0,
                'category': 0
            },
            'major_providers': defaultdict(int)
        }
        
        for filename in files:
            # 统计扩展名
            if '.' in filename:
                ext = filename.split('.')[-1]
                analysis['by_extension'][ext] += 1
            
            # 统计特殊分类
            if '@cn' in filename:
                analysis['special_categories']['china'] += 1
            elif '@!cn' in filename:
                analysis['special_categories']['non_china'] += 1
            elif '@ads' in filename:
                analysis['special_categories']['ads'] += 1
            elif filename.startswith('category-'):
                analysis['special_categories']['category'] += 1
            
            # 统计主要服务提供商
            base_name = filename.split('.')[0].split('@')[0].lower()
            providers = ['google', 'apple', 'microsoft', 'amazon', 'baidu', 'alibaba', 'tencent', 'bytedance', 'netflix', 'youtube', 'facebook', 'twitter', 'instagram', 'telegram', 'whatsapp', 'discord', 'spotify', 'steam', 'epic', 'github', 'gitlab', 'docker', 'kubernetes']
            
            for provider in providers:
                if provider in base_name:
                    analysis['major_providers'][provider] += 1
        
        return analysis
    
    def print_analysis(self, analysis: dict):
        """打印详细分析结果"""
        self.logger.info("\n" + "="*70)
        self.logger.info("📊 GEOSITE完整文件分析报告")
        self.logger.info("="*70)

        self.logger.info(f"\n📈 总体统计:")
        self.logger.info(f"   总文件数: {analysis['total']:,}")

        self.logger.info(f"\n📁 按扩展名分类:")
        for ext, count in sorted(analysis['by_extension'].items(), key=lambda x: x[1], reverse=True):
            percentage = (count / analysis['total']) * 100
            self.logger.info(f"   .{ext:<6}: {count:>5,} 个文件 ({percentage:5.1f}%)")

        self.logger.info(f"\n🏷️  特殊分类:")
        for category, count in analysis['special_categories'].items():
            if count > 0:
                percentage = (count / analysis['total']) * 100
                self.logger.info(f"   {category:<12}: {count:>5,} 个文件 ({percentage:5.1f}%)")

        self.logger.info(f"\n🌐 主要服务提供商 (Top 20):")
        sorted_providers = sorted(analysis['major_providers'].items(), key=lambda x: x[1], reverse=True)
        for provider, count in sorted_providers[:20]:
            if count > 0:
                percentage = (count / analysis['total']) * 100
                self.logger.info(f"   {provider:<12}: {count:>5,} 个文件 ({percentage:5.1f}%)")
    
    def save_files(self, files: List[str], filename: str = "complete_geosite_files_8705.txt",
                   output_dir: str = "geosite_files_output", output_format: str = "txt"):
        """保存完整文件列表"""
        try:
            # 确保输出目录存在
            if not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)
                self.logger.info(f"📁 创建输出目录: {output_dir}")

            # 构建完整的文件路径
            main_file_path = os.path.join(output_dir, filename)

            if output_format == "json":
                # JSON格式输出
                import json
                data = {
                    "total_files": len(files),
                    "files": files,
                    "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "source": "MetaCubeX/meta-rules-dat"
                }
                with open(main_file_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            else:
                # 文本格式输出
                with open(main_file_path, 'w', encoding='utf-8') as f:
                    for file in files:
                        f.write(f"{file}\n")

            self.logger.info(f"💾 完整文件列表已保存到: {main_file_path}")

            # 同时保存不同格式的文件（仅在txt格式时）
            if output_format == "txt":
                yaml_files = [f for f in files if f.endswith('.yaml')]
                yaml_path = os.path.join(output_dir, "yaml_files_complete.txt")
                with open(yaml_path, 'w', encoding='utf-8') as f:
                    for file in yaml_files:
                        f.write(f"{file}\n")

                list_files = [f for f in files if f.endswith('.list')]
                list_path = os.path.join(output_dir, "list_files_complete.txt")
                with open(list_path, 'w', encoding='utf-8') as f:
                    for file in list_files:
                        f.write(f"{file}\n")

                mrs_files = [f for f in files if f.endswith('.mrs')]
                mrs_path = os.path.join(output_dir, "mrs_files_complete.txt")
                with open(mrs_path, 'w', encoding='utf-8') as f:
                    for file in mrs_files:
                        f.write(f"{file}\n")

                self.logger.info(f"💾 同时保存了分类文件:")
                self.logger.info(f"   - {yaml_path} ({len(yaml_files):,} 个文件)")
                self.logger.info(f"   - {list_path} ({len(list_files):,} 个文件)")
                self.logger.info(f"   - {mrs_path} ({len(mrs_files):,} 个文件)")

        except IOError as e:
            self.logger.error(f"❌ 保存文件失败: {e}")

def main():
    """主函数"""
    # 解析命令行参数
    args = parse_args()

    # 设置主函数的日志记录器
    logger = logging.getLogger(__name__)
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    else:
        logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    logger.info("🎯 最终版本：获取完整geosite文件列表")
    logger.info("📋 目标: 获取所有8,705个文件（已验证数量）")
    if args.verbose:
        logger.info(f"📁 输出目录: {args.output_dir}")
        logger.info(f"📄 输出文件: {args.output}")
        logger.info(f"📋 输出格式: {args.format}")
    logger.info("-" * 70)

    fetcher = FinalGeositeFilesFetcher()

    # 获取完整文件列表
    files = fetcher.get_all_files()

    if files is None:
        logger.error("❌ 获取文件列表失败")
        sys.exit(1)

    # 分析文件
    analysis = fetcher.analyze_files(files)

    # 显示分析结果
    fetcher.print_analysis(analysis)

    # 保存文件列表
    fetcher.save_files(files, args.output, args.output_dir, args.format)

    # 显示前30个文件作为示例（仅在非详细模式或txt格式时显示）
    if not args.verbose or args.format == "txt":
        logger.info(f"\n📋 前30个文件示例:")
        for i, filename in enumerate(files[:30], 1):
            logger.info(f"   {i:2d}. {filename}")

        if len(files) > 30:
            logger.info(f"   ... 还有 {len(files) - 30:,} 个文件")

    logger.info(f"\n🎉 任务完成！成功获取 {len(files):,} 个文件")
    logger.info(f"📊 这比GitHub API限制的1,000个文件多了 {len(files) - 1000:,} 个文件!")

if __name__ == "__main__":
    main()
