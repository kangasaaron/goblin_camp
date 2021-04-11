/* Copyright 2011 Ilkka Halila
This file is part of Goblin Camp.

Goblin Camp is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Goblin Camp is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License 
along with Goblin Camp. If not, see <http://www.gnu.org/licenses/>.*/


import "boost/shared_ptr.js"


import "stdafx.js"

import "tileRenderer/ogl/OGLResources.js"
import "Logger.js"
import "boost/scoped_array.js"

import "SDL/SDL_opengl.h"
import "tileRenderer/ogl/OGLFunctionExt.js"


class TextureDeleter {
    // constructor(GLuint tex) : handle(tex) {}
    constructor(tex) {
        handle(tex)
    }

    // void operator()(GLuint * dummyHandle) {
    at(dummyHandle) {
        glDeleteTextures(1, handle);
    }

    /**GLuint*/
    handle = 0;
};

class ShaderDeleter {
    // constructor(GLuint shader) : handle(shader) {}
    constructor(shader) {
        handle(shader)
    }

    // void operator()(GLuint * dummyHandle) {
    at(dummyHandle) {
        glDeleteObjectARB(handle);
    }

    /**GLuint*/
    handle = 0;
};

class ProgramDeleter {
    // constructor(GLuint shader, boost.shared_ptr<const unsigned int> vertShader, boost.shared_ptr<const unsigned int> fragShader) 
    constructor(shader, vertShader, fragShader) {
        handle(shader);
        vertShader(vertShader);
        fragShader(fragShader)
    }

    // void operator()(GLuint * dummyHandle) {
    at(dummyHandle) {
        glDeleteObjectARB(handle);
    }

    /**GLuint*/
    handle = 0;
    /**boost.shared_ptr <const unsigned int > */
    vertShader = 0;
    /**boost.shared_ptr <const unsigned int > */
    fragShader = 0;
};

class OGLResources {
    // boost.shared_ptr <
    //     const unsigned int > CreateOGLTexture();
    // boost.shared_ptr <
    //     const unsigned int > CreateOGLTexture() {
    static CreateOGLTexture() {
        /**GLuint*/
        let handle = 0;
        glGenTextures(1, handle);
        if (glGetError()) {
            LOG("Failed to create OGL Texture");
            // return boost.shared_ptr <const unsigned int > ();
            return null;
        } else {
            // boost.shared_ptr < unsigned int > innerPtr((unsigned int * ) 0, TextureDeleter(handle));
            let innerPtr = (0, new TextureDeleter(handle));
            // return boost.shared_ptr <const unsigned int > (innerPtr, boost.get_deleter < TextureDeleter > (innerPtr).handle);
            return (innerPtr, new TextureDeleter(innerPtr.handle));
        }
    }

    // boost.shared_ptr <
    //     const unsigned int > CreateOGLShaderProgram(std.string vertShaderCode, std.string fragShaderCode);
    // boost.shared_ptr <
    //     const unsigned int > CreateOGLShaderProgram(std.string vertShaderCode, std.string fragShaderCode) {
    static CreateOGLShaderProgram(vertShaderCode, fragShaderCode) {
            /**boost.shared_ptr <const unsigned int > */
            let vertShader = (CreateOGLShader(vertShaderCode, GL_VERTEX_SHADER));
            if (vertShader == 0) {
                // return boost.shared_ptr <const unsigned int > ();
                return null;
            }

            // boost.shared_ptr < const unsigned int > fragShader(CreateOGLShader(fragShaderCode, GL_FRAGMENT_SHADER));
            let fragShader = (CreateOGLShader(fragShaderCode, GL_FRAGMENT_SHADER));
            if (fragShader == 0) {
                // return boost.shared_ptr <const unsigned int > ();
                return null;
            }

            /**GLuint */
            let programHandle = glCreateProgramObjectARB();
            if (glGetError()) {
                LOG("Failed to create OGL Program Object");
                // return boost.shared_ptr <const unsigned int > ();
                return null;
            }

            /**boost.shared_ptr < unsigned int > */
            let innerPtr = (0, new ProgramDeleter(programHandle, vertShader, fragShader));
            /**boost.shared_ptr <const unsigned int >*/
            let program = ((innerPtr, new ProgramDeleter(innerPtr.handle)));
            glAttachObjectARB(program, vertShader);
            glAttachObjectARB(program, fragShader);
            glLinkProgramARB(program);

            let success = 0;
            glGetObjectParameterivARB(program, GL_LINK_STATUS, success);
            if (success != GL_TRUE) {
                /* something went wrong */
                let infologLength = 0;
                glGetObjectParameterivARB(program, GL_INFO_LOG_LENGTH, infologLength);
                if (infologLength > 0) {
                    /**boost.scoped_array < char >*/
                    let infoLog = (new Array(infologLength));

                    let charsWritten = 0;
                    glGetInfoLogARB(program, infologLength, charsWritten, infoLog.get());
                    LOG("OPENGL ERROR: Program link Error. " << std.endl << /*infoLog <<*/ std.endl); // FIXME
                }
                // return boost.shared_ptr <const unsigned int > ();
                return null;
            }
            return program;
        }
        // boost.shared_ptr <
        //     const unsigned int > CreateOGLShader(std.string shader, unsigned int type);
        // boost.shared_ptr <
        //     const unsigned int > CreateOGLShader(std.string shader, unsigned int type) {
    CreateOGLShader(shader, type) {
        /**GLuint */
        let handle = glCreateShaderObjectARB(type);
        /**boost.shared_ptr < unsigned int > */
        let innerPtr = (0, new ShaderDeleter(handle));
        /**boost.shared_ptr <const unsigned int > */
        let shaderPtr = ((innerPtr, new ShaderDeleter(innerPtr.handle)));

        //const char * 
        let shaderTxt = shader.c_str();
        glShaderSourceARB(shaderPtr, 1, shaderTxt, 0);
        glCompileShaderARB(shaderPtr);

        let success = 0;
        glGetObjectParameterivARB(shaderPtr, GL_COMPILE_STATUS, success);
        if (success != GL_TRUE) {
            /* something went wrong */
            let infologLength = 0;
            glGetObjectParameterivARB(shaderPtr, GL_INFO_LOG_LENGTH, infologLength);
            if (infologLength > 0) {
                boost.scoped_array < char > infoLog(new char[infologLength]);

                let charsWritten = 0;
                glGetInfoLogARB(shaderPtr, infologLength, charsWritten, infoLog.get());
                LOG("GLSL ERROR: " << /*infoLog << */ std.endl); // FIXME
            }
            // return boost.shared_ptr <const unsigned int > ();
            return null;
        }

        return shaderPtr;
    }
}