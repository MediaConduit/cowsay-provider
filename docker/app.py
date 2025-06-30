from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for Docker health checks"""
    try:
        # Test that cowsay command is available - try common paths
        cowsay_paths = ['/usr/games/cowsay', 'cowsay']
        cowsay_found = False
        
        for cowsay_path in cowsay_paths:
            try:
                result = subprocess.run([cowsay_path, 'test'], capture_output=True, text=True, check=True)
                cowsay_found = True
                break
            except (subprocess.CalledProcessError, FileNotFoundError):
                continue
        
        if cowsay_found:
            return jsonify({
                'status': 'healthy',
                'service': 'cowsay',
                'version': 'cowsay available',
                'timestamp': __import__('time').time()
            })
        else:
            return jsonify({
                'status': 'unhealthy',
                'error': 'cowsay command not found in any expected location'
            }), 500
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/cowsay', methods=['POST'])
def cowsay():
    data = request.get_json()
    text = data.get('text', 'Moo!')
    
    try:
        # Try common cowsay paths
        cowsay_paths = ['/usr/games/cowsay', 'cowsay']
        result = None
        
        for cowsay_path in cowsay_paths:
            try:
                result = subprocess.run([cowsay_path, text], capture_output=True, text=True, check=True)
                break
            except (subprocess.CalledProcessError, FileNotFoundError):
                continue
        
        if result:
            return jsonify({'cowsayOutput': result.stdout})
        else:
            return jsonify({'error': 'cowsay command not found'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
